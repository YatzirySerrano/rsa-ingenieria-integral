<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    // Metodo para correr la migracion 
    public function up(): void
    {
        Schema::create('marcas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120)->unique();

            $table->string('status', 10)->default('activo')->index(); // activo|inactivo
            $table->timestamps();
        });
    }

    // Metodo para revertir la migracion
    public function down(): void {
        Schema::dropIfExists('marcas');
    }

};
