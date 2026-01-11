<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('usuario_id')
                ->nullable()
                ->constrained('usuarios')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->string('accion', 30); // CREATE|UPDATE|DELETE_LOGIC|RESTORE|SEND_QUOTE|LOGIN|LOGOUT
            $table->string('tabla', 80);
            $table->unsignedBigInteger('registro_id')->nullable();

            $table->string('detalle', 255)->nullable();

            // si quieres luego guardar json, lo agregas (pero ahorita lo dejé concreto)
            // $table->json('payload')->nullable();

            $table->string('status', 10)->default('activo')->index();
            $table->timestamps();

            $table->index(['tabla', 'registro_id'], 'idx_logs_tabla_registro');
            $table->index('accion', 'idx_logs_accion');
            $table->index(['usuario_id', 'status'], 'idx_logs_usuario_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs');
    }
};
