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
        Schema::create('producto_medias', function (Blueprint $table) {
            $table->id();

            $table->foreignId('producto_id')
                ->constrained('productos')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            // imagen|video (string para mantener todo consistente con tu preferencia)
            $table->string('tipo', 10)->default('imagen');

            // enlace a storage/CDN/Youtube/etc
            $table->string('url', 2048);

            // para ordenar la galería
            $table->unsignedInteger('orden')->default(1);

            // “foto principal” o “video principal”
            $table->boolean('principal')->default(false);

            $table->string('status', 10)->default('activo')->index();
            $table->timestamps();

            $table->index(['producto_id', 'status'], 'idx_producto_medias_producto_status');
            $table->index(['producto_id', 'orden'], 'idx_producto_medias_orden');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producto_medias');
    }
};
