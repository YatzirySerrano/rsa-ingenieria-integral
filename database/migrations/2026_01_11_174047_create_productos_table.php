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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('marca_id')
                ->nullable()
                ->constrained('marcas')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('categoria_id')
                ->nullable()
                ->constrained('categorias')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->string('sku', 80)->unique();
            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();

            $table->integer('stock')->default(0);
            $table->decimal('costo_lista', 12, 2)->default(0);
            $table->decimal('precio_venta', 12, 2)->default(0);

            // Auditoría (quién hizo algo)
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('usuarios')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('usuarios')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('deleted_by')
                ->nullable()
                ->constrained('usuarios')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->string('status', 10)->default('activo')->index();
            $table->timestamps();

            $table->index(['marca_id', 'status'], 'idx_productos_marca_status');
            $table->index(['categoria_id', 'status'], 'idx_productos_categoria_status');
            $table->index('nombre', 'idx_productos_nombre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
