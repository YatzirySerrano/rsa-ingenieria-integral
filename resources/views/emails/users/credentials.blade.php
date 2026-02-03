<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Acceso</title>
</head>

<body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#ffffff;border:1px solid #e6e8ef;border-radius:16px;padding:20px;">

      <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">
        Acceso a {{ $appName }}
      </h2>

      <p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:#334155;">
        Hola <strong>{{ $user->name }}</strong>, se creó tu usuario en el sistema.
      </p>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:14px 0;">
        <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Tus credenciales:</p>

        <p style="margin:0;font-size:14px;line-height:1.6;color:#0f172a;">
          <strong>Correo:</strong> {{ $user->email }}<br>
          <strong>Contraseña:</strong> <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">{{ $plainPassword }}</span>
        </p>
      </div>

      <p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:#334155;">
        Inicia sesión aquí:
        <a href="{{ $loginUrl }}" style="color:#0f172a;font-weight:700;">{{ $loginUrl }}</a>
      </p>

      <p style="margin:0;font-size:12px;line-height:1.55;color:#64748b;">
        Recomendación: cambia tu contraseña después del primer acceso.
      </p>

    </div>

    <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
      {{ $appName }}
    </p>
  </div>
</body>
</html>