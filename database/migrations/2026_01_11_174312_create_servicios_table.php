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
        Schema::create('servicios', function (Blueprint $table) {
            $table->id();

            $table->foreignId('categoria_id')
                ->nullable()
                ->constrained('categorias')
                ->nullOnDelete()
                ->cascadeOnUpdate();

            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 12, 2)->default(0);

            $table->string('status', 10)->default('activo')->index();
            $table->timestamps();

            $table->index(['categoria_id', 'status'], 'idx_servicios_categoria_status');
            $table->index('nombre', 'idx_servicios_nombre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};
