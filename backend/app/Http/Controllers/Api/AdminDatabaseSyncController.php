<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminDatabaseSyncController extends Controller
{
    protected string $syncDir;
    protected string $sqlFile;
    protected string $metaFile;

    public function __construct()
    {
        $this->syncDir = base_path('database/sync');
        $this->sqlFile = $this->syncDir . '/acme_latest_backup.sql';
        $this->metaFile = $this->syncDir . '/sync_meta.json';

        if (!is_dir($this->syncDir)) {
            @mkdir($this->syncDir, 0755, true);
        }
    }

    /**
     * Get synchronization status and codebase backup metadata.
     */
    public function status(): JsonResponse
    {
        $hasBackup = file_exists($this->sqlFile);
        $meta = null;

        if ($hasBackup && file_exists($this->metaFile)) {
            $meta = json_decode(file_get_contents($this->metaFile), true);
        }

        // Current database status
        $currentTables = [];
        $totalCurrentRecords = 0;

        try {
            $tablesObj = DB::select('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
            foreach ($tablesObj as $obj) {
                $keys = array_keys((array) $obj);
                $tableName = $obj->{$keys[0]};
                $count = DB::table($tableName)->count();
                $currentTables[$tableName] = $count;
                $totalCurrentRecords += $count;
            }
        } catch (\Throwable $e) {
            // ignore if db not connected
        }

        return response()->json([
            'success' => true,
            'has_backup' => $hasBackup,
            'backup_file_path' => 'backend/database/sync/acme_latest_backup.sql',
            'backup_file_size' => $hasBackup ? $this->formatBytes(filesize($this->sqlFile)) : null,
            'backup_updated_at' => $hasBackup ? date('Y-m-d H:i:s', filemtime($this->sqlFile)) : null,
            'meta' => $meta,
            'current_db' => [
                'total_tables' => count($currentTables),
                'total_records' => $totalCurrentRecords,
                'tables' => $currentTables,
            ],
        ]);
    }

    /**
     * Export / Backup live MySQL database into codebase repository file.
     */
    public function backup(): JsonResponse
    {
        try {
            $pdo = DB::connection()->getPdo();
            $tablesObj = DB::select('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');

            $handle = fopen($this->sqlFile, 'w');
            if (!$handle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to write backup file to: ' . $this->sqlFile,
                ], 500);
            }

            $timestamp = now()->toDateTimeString();
            $dbName = config('database.connections.mysql.database');

            // Header
            fwrite($handle, "-- ============================================================\n");
            fwrite($handle, "-- AMIDA Supplies Limited - Database Synchronization Snapshot\n");
            fwrite($handle, "-- Exported At: {$timestamp}\n");
            fwrite($handle, "-- Database: {$dbName}\n");
            fwrite($handle, "-- ============================================================\n\n");
            fwrite($handle, "SET NAMES utf8mb4;\n");
            fwrite($handle, "SET FOREIGN_KEY_CHECKS = 0;\n\n");

            $metaTables = [];
            $totalRecords = 0;

            foreach ($tablesObj as $obj) {
                $keys = array_keys((array) $obj);
                $table = $obj->{$keys[0]};

                // Skip migrations or jobs if needed, but keeping all ensures 100% full reproduction
                $createRes = DB::select("SHOW CREATE TABLE `{$table}`");
                $createSql = $createRes[0]->{'Create Table'} ?? null;

                if (!$createSql) continue;

                fwrite($handle, "-- ------------------------------------------------------------\n");
                fwrite($handle, "-- Table structure for `{$table}`\n");
                fwrite($handle, "-- ------------------------------------------------------------\n");
                fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");
                fwrite($handle, $createSql . ";\n\n");

                // Dump data
                $rows = DB::table($table)->get();
                $rowCount = count($rows);
                $metaTables[$table] = $rowCount;
                $totalRecords += $rowCount;

                if ($rowCount > 0) {
                    fwrite($handle, "-- Data for `{$table}` ({$rowCount} rows)\n");

                    // Batch inserts
                    $chunks = $rows->chunk(100);
                    foreach ($chunks as $chunk) {
                        $colNames = array_keys((array) $chunk->first());
                        $escapedCols = array_map(fn($c) => "`{$c}`", $colNames);
                        $colList = implode(', ', $escapedCols);

                        $valListArray = [];
                        foreach ($chunk as $row) {
                            $vals = [];
                            foreach ($colNames as $col) {
                                $val = $row->$col;
                                if (is_null($val)) {
                                    $vals[] = 'NULL';
                                } elseif (is_numeric($val) && !is_string($val)) {
                                    $vals[] = $val;
                                } else {
                                    $vals[] = $pdo->quote((string) $val);
                                }
                            }
                            $valListArray[] = '(' . implode(', ', $vals) . ')';
                        }

                        $insertSql = "INSERT INTO `{$table}` ({$colList}) VALUES \n" . implode(",\n", $valListArray) . ";\n";
                        fwrite($handle, $insertSql);
                    }
                    fwrite($handle, "\n");
                }
            }

            fwrite($handle, "SET FOREIGN_KEY_CHECKS = 1;\n");
            fclose($handle);

            // Write metadata
            $metaData = [
                'exported_at' => $timestamp,
                'file_size' => $this->formatBytes(filesize($this->sqlFile)),
                'file_size_bytes' => filesize($this->sqlFile),
                'total_tables' => count($metaTables),
                'total_records' => $totalRecords,
                'tables' => $metaTables,
            ];
            file_put_contents($this->metaFile, json_encode($metaData, JSON_PRETTY_PRINT));

            return response()->json([
                'success' => true,
                'message' => "Database synchronized and backed up to codebase successfully! ({$totalRecords} rows in " . count($metaTables) . " tables)",
                'meta' => $metaData,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database export failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore / Merge codebase SQL backup into target MySQL database.
     */
    public function restore(): JsonResponse
    {
        if (!file_exists($this->sqlFile)) {
            return response()->json([
                'success' => false,
                'message' => 'No codebase backup file found at: backend/database/sync/acme_latest_backup.sql. Please run backup first.',
            ], 404);
        }

        try {
            $sqlContent = file_get_contents($this->sqlFile);
            if (empty(trim($sqlContent))) {
                return response()->json([
                    'success' => false,
                    'message' => 'The backup file is empty.',
                ], 400);
            }

            // Execute multi-statement SQL
            DB::unprepared("SET FOREIGN_KEY_CHECKS = 0;");
            DB::unprepared($sqlContent);
            DB::unprepared("SET FOREIGN_KEY_CHECKS = 1;");

            // Recalculate stats
            $tablesObj = DB::select('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
            $restoredCount = count($tablesObj);
            $totalRecords = 0;
            foreach ($tablesObj as $obj) {
                $keys = array_keys((array) $obj);
                $table = $obj->{$keys[0]};
                $totalRecords += DB::table($table)->count();
            }

            return response()->json([
                'success' => true,
                'message' => "Database merged and restored successfully! ({$totalRecords} total records across {$restoredCount} tables restored)",
                'restored_tables' => $restoredCount,
                'total_records' => $totalRecords,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to merge and restore database: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download the backup file directly.
     */
    public function download(): BinaryFileResponse|JsonResponse
    {
        if (!file_exists($this->sqlFile)) {
            return response()->json([
                'success' => false,
                'message' => 'No backup file available for download.',
            ], 404);
        }

        return response()->download($this->sqlFile, 'amida_database_backup_' . date('Y_m_d_His') . '.sql');
    }

    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
