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
        Schema::create('cotizacions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('usuario_id')
                ->nullable()
                ->constrained('usuarios')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('persona_id')
                ->nullable()
                ->constrained('personas')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->string('folio', 40)->unique();
            $table->uuid('token')->unique();

            // estado del proceso del ticket
            $table->string('estatus', 20)->default('BORRADOR');

            $table->string('email_destino', 190)->nullable();
            $table->string('telefono_destino', 30)->nullable();

            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);

            // eliminación lógica
            $table->string('status', 10)->default('activo')->index();

            $table->timestamps();

            $table->index(['usuario_id', 'status'], 'idx_cotizacions_usuario_status');
            $table->index(['estatus', 'status'], 'idx_cotizacions_estatus_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cotizacions');
    }
};
