<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    // Metodo para ejecutar la migracion
    public function up(): void
    {
        Schema::create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120);
            $table->string('tipo', 20)->default('PRODUCTO'); // PRODUCTO|SERVICIO

            $table->string('status', 10)->default('activo')->index();
            $table->timestamps();

            $table->unique(['nombre', 'tipo'], 'uk_categorias_nombre_tipo');
        });
    }

    // Metodo para revertir migracion
    public function down(): void
    {
        Schema::dropIfExists('categorias');
    }

};
