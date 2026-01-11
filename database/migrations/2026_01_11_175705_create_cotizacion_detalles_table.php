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
        Schema::create('cotizacion_detalles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cotizacion_id')
                ->constrained('cotizacions')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // un detalle puede ser producto o servicio
            $table->foreignId('producto_id')
                ->nullable()
                ->constrained('productos')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('servicio_id')
                ->nullable()
                ->constrained('servicios')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->decimal('cantidad', 12, 2)->default(1);
            $table->decimal('precio_unitario', 12, 2)->default(0);
            $table->decimal('total_linea', 12, 2)->default(0);

            $table->string('status', 10)->default('activo')->index();
            $table->timestamps();

            $table->index(['cotizacion_id', 'status'], 'idx_detalles_cotizacion_status');
            $table->index('producto_id', 'idx_detalles_producto');
            $table->index('servicio_id', 'idx_detalles_servicio');

            // evita duplicar el mismo item en el carrito (opcional pero recomendado)
            $table->unique(['cotizacion_id', 'producto_id', 'servicio_id'], 'uk_detalle_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cotizacion_detalles');
    }
};
