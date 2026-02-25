<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ServicioController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\PublicProductoController;
use App\Http\Controllers\Panel\CotizacionPanelController;
use App\Http\Controllers\Panel\CotizacionDetalleController;
use App\Http\Controllers\Public\CotizacionPublicController;
use App\Http\Controllers\DashboardController;

// Index del sitio web
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Página pública de servicios cctv
Route::get('/servicios/cctv', function () {
    return Inertia::render('servicios/cctv');
})->name('Servicios.cctv');

Route::get('/catalogo', [PublicProductoController::class, 'index'])
    ->name('catalogo.publico');

// GUEST (público) -> separado para no pelearse con /cotizaciones (admin)
Route::get('/cotizar', [CotizacionPublicController::class, 'create'])->name('cotizar.create');
Route::post('/cotizar', [CotizacionPublicController::class, 'store'])->name('cotizar.store');
Route::get('/cotizacion/{token}', [CotizacionPublicController::class, 'show'])->name('cotizacion.public.show');

// -------------------------
// Protected (Auth)
// -------------------------
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Servicios (sin show)
    Route::resource('servicios', ServicioController::class)->only(['index','store','update','destroy']);
    Route::patch('servicios/{servicio}/reactivate', [ServicioController::class, 'reactivate'])
        ->name('servicios.reactivate');

    // Categorías / Marcas / Personas (sin show)
    Route::resource('categorias', CategoriaController::class)->except(['show']);
    Route::resource('marcas', MarcaController::class)->except(['show']);
    Route::resource('personas', PersonaController::class)->except(['show']);

    // -------------------------
    // Admin: Usuarios
    // -------------------------
    Route::prefix('admin')->group(function () {
        Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
        Route::post('usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
        Route::put('usuarios/{user}', [UsuarioController::class, 'update'])->name('usuarios.update');
        Route::delete('usuarios/{user}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');

        // Lookup de personas (para combobox / search)
        Route::get('usuarios/personas-lookup', [UsuarioController::class, 'personasLookup'])
            ->name('usuarios.personasLookup');

        // Activar usuario
        Route::patch('usuarios/{user}/activar', [UsuarioController::class, 'activar'])
            ->name('usuarios.activar');
    });

    // -------------------------
    // Productos
    // -------------------------
    Route::resource('productos', ProductoController::class);
    Route::post('productos/{producto}/medias', [ProductoController::class, 'mediaUpload'])
        ->name('productos.medias.upload');
    Route::patch('productos/{producto}/medias/order', [ProductoController::class, 'mediaUpdateOrder'])
        ->name('productos.medias.order');
    Route::patch('productos/{producto}/medias/{media}/main', [ProductoController::class, 'mediaSetMain'])
        ->name('productos.medias.main');
    Route::patch('productos/{producto}/medias/{media}', [ProductoController::class, 'mediaUpdate'])
        ->name('productos.medias.update');
    Route::delete('productos/{producto}/medias/{media}', [ProductoController::class, 'mediaDestroy'])
        ->name('productos.medias.destroy');
    Route::patch('productos/{producto}/toggle-status', [ProductoController::class, 'toggleStatus'])
        ->name('productos.toggleStatus');

    // ADMIN (panel interno) -> URL limpia como tus otros CRUDs
    Route::prefix('cotizaciones')->name('cotizaciones.')->group(function () {
        Route::get('/', [CotizacionPanelController::class, 'index'])->name('index');

        // Crear cotización desde panel
        Route::get('/create', [CotizacionPanelController::class, 'create'])->name('create');
        Route::post('/', [CotizacionPanelController::class, 'store'])->name('store');

        Route::get('/clientes-lookup', [CotizacionPanelController::class, 'clientesLookup'])
        ->name('clientesLookup');

        // Detalles: editar SOLO cantidad + quitar (status inactivo)    a
        Route::match(['put', 'patch'], '/detalles/{detalle}', [CotizacionDetalleController::class, 'update'])
            ->name('detalles.update');
        Route::delete('/detalles/{detalle}', [CotizacionDetalleController::class, 'destroy'])
            ->name('detalles.destroy');

        // Ver cotización
        Route::get('/{cotizacion}', [CotizacionPanelController::class, 'show'])->name('show');

        // Carrito: agregar item (desde catálogo)
        Route::post('/{cotizacion}/items', [CotizacionPanelController::class, 'addItem'])->name('items.add');

        // Flujos de estatus
        Route::post('/{cotizacion}/reply', [CotizacionPanelController::class, 'reply'])->name('reply');
        Route::post('/{cotizacion}/mark-sent', [CotizacionPanelController::class, 'markSent'])->name('markSent');

        Route::post('/{cotizacion}/send-email', [CotizacionPanelController::class, 'sendEmail'])->name('sendEmail');

        Route::put('/{cotizacion}', [CotizacionPanelController::class, 'update'])->name('update');
        Route::delete('/{cotizacion}', [CotizacionPanelController::class, 'destroy'])->name('destroy');

    });

});

require __DIR__ . '/settings.php';
