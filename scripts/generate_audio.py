#!/usr/bin/env python3
"""
Generate all GAIA narration audio clips using edge-tts.
Voice: es-PE-CamilaNeural (Camila dulce)
Pitch: +15Hz (softer/sweeter)
Rate: -8% (slightly slower, more deliberate)
"""

import asyncio
import json
import os
import sys

import edge_tts

# ── Configuration ──
VOICE = "es-PE-CamilaNeural"
PITCH = "+15Hz"
RATE = "-8%"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio", "gaia")

# ── All narration clips with LONGER, more engaging texts ──
CLIPS = {
    # ── Cinema Intro ──
    "intro_hola": {
        "text": "Hola.",
    },
    "intro_soy_gaia": {
        "text": "Soy GAIA.",
    },
    "intro_completa": {
        "text": "Y voy a cambiar la forma en que manejas tu negocio.",
    },

    # ── Slide: El Problema ──
    "pain_intro": {
        "text": (
            "¿Te suena familiar? Hojas de Excel por todos lados, datos que no cuadran, "
            "decisiones a ciegas. Un sistema para facturar, otro para inventario, "
            "WhatsApp para los pedidos, y nada, absolutamente nada, habla entre sí. "
            "Cada mes pierdes horas valiosas copiando información de un lado a otro."
        ),
    },
    "pain_solucion": {
        "text": (
            "Yo puedo arreglar eso. No mañana, no la próxima semana. Ahora mismo. "
            "Déjame mostrarte cómo funciona un negocio cuando todo está conectado."
        ),
    },

    # ── Slide: CEO Dashboard / Athena ──
    "intro_bienvenida": {
        "text": (
            "Bienvenido a GAIA Prime. Lo que estás a punto de ver "
            "no es una presentación bonita. Son datos reales, dashboards reales, "
            "herramientas que ya están funcionando en empresas como la tuya."
        ),
    },
    "mod_athena_titulo": {
        "text": (
            "Athena. Tu analista de inteligencia de negocios. Imagina abrir tu negocio "
            "cada mañana y ver exactamente cómo está la salud de tu empresa. "
            "Sin pedirle reportes a nadie."
        ),
    },
    "mod_athena_desc": {
        "text": (
            "Athena construye dashboards automáticamente con tus datos. "
            "Score de salud del negocio, más de sesenta KPIs en tiempo real, "
            "detección de anomalías con inteligencia artificial, "
            "y forecasting que predice tus ventas del próximo mes. "
            "Decisiones basadas en datos, no en corazonadas."
        ),
    },

    # ── Slide: Hermes ERP ──
    "mod_hermes_titulo": {
        "text": (
            "Hermes. El sistema nervioso de todo tu negocio. "
            "Ventas, inventario, compras, facturación. Todo en un solo lugar."
        ),
    },
    "mod_hermes_desc": {
        "text": (
            "Vendes algo, el inventario baja automáticamente, "
            "la factura se genera, el bodeguero recibe la orden en su celular. "
            "Sin copiar datos, sin errores, sin hojas de cálculo. "
            "Facturación electrónica CFDI cuatro punto cero incluida. "
            "Multi-precio, multi-sucursal, multi-moneda."
        ),
    },
    "mod_hermes_dato": {
        "text": (
            "Los negocios que usan Hermes reducen errores de inventario "
            "en un ochenta por ciento desde el primer mes. "
            "Y lo mejor, no necesitas ser experto en tecnología para usarlo."
        ),
    },

    # ── Slide: Mercuria Commerce ──
    "mod_commerce_titulo": {
        "text": (
            "Mercuria. Tu tienda online lista en sesenta segundos. "
            "Tu catálogo conectado, pedidos automatizados."
        ),
    },
    "mod_commerce_desc": {
        "text": (
            "Elige tu tipo de negocio, ponle nombre, y listo. "
            "Tu storefront propio, pedidos por WhatsApp, stock en tiempo real. "
            "¿Vendes en Mercado Libre? También conectado. "
            "Un cliente compra en tu tienda y automáticamente se descuenta del inventario, "
            "se genera la guía de envío y la factura. Sin tocar nada."
        ),
    },

    # ── Slide: Hephaestus ──
    "mod_hephaestus_titulo": {
        "text": (
            "Hefestos. Tu motor de trabajo colaborativo. "
            "Donde cada tarea sabe quién la hace, cuándo y por qué."
        ),
    },
    "mod_hephaestus_desc": {
        "text": (
            "Grafos de trabajo inteligentes. El operador ve SUS tareas en el celular, "
            "sube foto del terminado, y el proyecto avanza solo. "
            "La ruta crítica se calcula automáticamente, "
            "las dependencias se resuelven, y tú ves el progreso en tiempo real. "
            "Adiós a los correos interminables preguntando quién hizo qué."
        ),
    },

    # ── Slide: Iris ──
    "mod_iris_titulo": {
        "text": (
            "Iris. Tu centro de comunicaciones inteligente. "
            "Donde tu equipo se conecta sin salir del sistema."
        ),
    },
    "mod_iris_desc": {
        "text": (
            "Chat interno con canales, agentes de inteligencia artificial "
            "que participan en la conversación con contexto real de tu negocio, "
            "y un mapa organizacional en tiempo real. "
            "No es Slack. No es Teams. Es comunicación que entiende tu operación."
        ),
    },

    # ── Slide: GAIA Chat ──
    "chat_saludo": {
        "text": (
            "Hola, soy GAIA. Tu asistente empresarial con inteligencia artificial. "
            "Puedes preguntarme lo que quieras sobre tu negocio, y te respondo "
            "con datos reales, en español, las veinticuatro horas."
        ),
    },
    "chat_pregunta_giro": {
        "text": (
            "Cuéntame, ¿a qué se dedica tu empresa? ¿Vendes productos, ofreces servicios, "
            "manufactura? No importa el giro, yo me adapto a ti."
        ),
    },

    # ── Slide: Comparison ──
    "comp_intro": {
        "text": (
            "Hagamos cuentas. Un ERP como SAP o Contpaqi, "
            "un BI como Power BI o Tableau, un gestor de proyectos como Asana, "
            "chat interno como Slack, tienda online como Shopify, "
            "y un asistente de inteligencia artificial como ChatGPT. "
            "Seis herramientas desconectadas que fácilmente te cuestan "
            "entre quinientos y mil dólares mensuales. Con GAIA Prime los tienes todos, "
            "integrados, hablando entre sí."
        ),
    },
    "comp_precio": {
        "text": (
            "Y el precio te va a sorprender. GAIA Core es completamente gratis "
            "durante tres meses, sin tarjeta, sin compromiso. "
            "Después, desde cuatrocientos noventa y nueve pesos mexicanos al mes. "
            "Menos de lo que pagas por un software que ni usas."
        ),
    },

    # ── Slide: Pricing ──
    "precio_titulo": {
        "text": (
            "Planes diseñados para crecer contigo. Sin sorpresas, sin letras chiquitas."
        ),
    },
    "precio_core": {
        "text": (
            "GAIA Core. Tres meses completamente gratis para que lo pruebes sin riesgo. "
            "Te incluye el ERP completo, ventas, inventario, compras, facturación SAT, "
            "tu storefront para vender online, y tres usuarios. "
            "Después del periodo de prueba, cuatrocientos noventa y nueve pesos al mes."
        ),
    },
    "precio_cierre": {
        "text": (
            "¿Y si quieres toda la inteligencia artificial? "
            "GAIA Pro con IA: solo trescientos pesos adicionales al mes. "
            "Dashboards ejecutivos, forecasting, chat multi-agente, y soporte prioritario. "
            "Menos de lo que gastas en café al mes."
        ),
    },

    # ── Slide: Final ──
    "cierre_pregunta": {
        "text": (
            "Tu negocio merece más que un Excel. Merece tecnología de primer nivel, "
            "inteligencia artificial que entiende tu operación, "
            "y un sistema que trabaja para ti las veinticuatro horas."
        ),
    },
    "cierre_accion": {
        "text": (
            "Empieza gratis hoy. Sin tarjeta de crédito, sin compromisos. "
            "Un ERP completo con inteligencia artificial en sesenta segundos. "
            "Te espero adentro. Yo soy GAIA, y trabajo para ti."
        ),
    },

    # ── Extra clips (for chat, trial interactions) ──
    "chat_impresionada": {
        "text": (
            "Qué interesante. Déjame mostrarte exactamente cómo GAIA puede ayudarte con eso. "
            "Tengo varias ideas que creo te van a encantar."
        ),
    },
    "chat_trial": {
        "text": (
            "¿Quieres probarlo gratis? Solo necesito tu nombre y correo electrónico. "
            "En menos de un minuto estás dentro."
        ),
    },
    "hero_dashboard": {
        "text": (
            "Esto es lo que verás cada mañana al abrir tu negocio. "
            "Todo en tiempo real, todo bajo control. "
            "Ventas de hoy, inventario crítico, margen de ganancia, alertas inteligentes."
        ),
    },
    "hero_numeros": {
        "text": (
            "Estos números no son de mentira. Son datos reales, "
            "de clientes reales, actualizándose ahora mismo. "
            "Cada gráfica, cada métrica, conectada directamente a tu operación."
        ),
    },
    "cierre_despedida": {
        "text": (
            "Gracias por tomarte el tiempo de conocerme. "
            "Te espero adentro. Yo soy GAIA, y trabajo para ti."
        ),
    },
    "mod_hera_titulo": {
        "text": "Hera. Tu guardiana de seguridad y control de acceso.",
    },
    "mod_hera_desc": {
        "text": (
            "Control de acceso inteligente basado en roles. "
            "Cada quien ve solo lo que necesita ver, ni más ni menos. "
            "Permisos granulares, auditoría completa, sesiones seguras."
        ),
    },
    "proactiva_intro": {
        "text": "Pero lo que realmente me hace diferente es esto.",
    },
    "proactiva_desc": {
        "text": (
            "Yo no espero a que me preguntes. Detecto problemas antes de que sucedan "
            "y te aviso con tiempo para que actúes. Soy proactiva."
        ),
    },
    "proactiva_ejemplo": {
        "text": (
            "Oye, detecté que tu inventario de café está bajando más rápido de lo normal. "
            "Si no haces un pedido hoy, te vas a quedar sin stock el viernes. "
            "¿Quieres que prepare la orden de compra?"
        ),
    },
    "proactiva_ejemplo2": {
        "text": (
            "Tu margen de ganancia bajó tres por ciento esta semana. "
            "Te muestro exactamente por qué y qué puedes hacer al respecto."
        ),
    },
    "precio_pro": {
        "text": (
            "GAIA Pro. Con toda la inteligencia artificial incluida. "
            "Trescientos pesos al mes adicionales. Tres usuarios. "
            "Veinticinco pesos por cada usuario extra."
        ),
    },
}


async def generate_clip(clip_id: str, text: str) -> dict:
    """Generate a single audio clip with edge-tts."""
    mp3_path = os.path.join(OUTPUT_DIR, f"{clip_id}.mp3")
    wav_path = os.path.join(OUTPUT_DIR, f"{clip_id}.wav")

    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE,
        pitch=PITCH,
        rate=RATE,
    )

    # edge-tts outputs MP3 by default
    await communicate.save(mp3_path)

    # Convert MP3 → WAV using ffmpeg
    import subprocess
    subprocess.run([
        "ffmpeg", "-y", "-i", mp3_path,
        "-acodec", "pcm_s16le", "-ar", "24000", "-ac", "1",
        wav_path
    ], capture_output=True, check=True)

    # Remove MP3
    os.remove(mp3_path)

    # Get duration
    import wave
    with wave.open(wav_path, 'r') as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        duration = round(frames / rate, 2)

    return {
        "file": f"{clip_id}.wav",
        "duration": duration,
        "text": text,
    }


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"🎙️  Generating {len(CLIPS)} audio clips")
    print(f"   Voice: {VOICE}")
    print(f"   Pitch: {PITCH}  Rate: {RATE}")
    print(f"   Output: {OUTPUT_DIR}")
    print()

    manifest = {
        "voice": VOICE,
        "description": "Camila dulce — es-PE-CamilaNeural, pitch +15Hz, rate -8%",
        "model": "edge-tts (Microsoft Azure Neural)",
        "pitch": PITCH,
        "rate": RATE,
        "clips": {},
    }

    total = len(CLIPS)
    for i, (clip_id, clip_data) in enumerate(CLIPS.items(), 1):
        text = clip_data["text"]
        preview = text[:60] + ("..." if len(text) > 60 else "")
        print(f"  [{i:2d}/{total}] {clip_id:30s} → {preview}")

        try:
            result = await generate_clip(clip_id, text)
            manifest["clips"][clip_id] = result
            print(f"           ✅ {result['duration']}s")
        except Exception as e:
            print(f"           ❌ Error: {e}")

    # Save manifest
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Done! {len(manifest['clips'])} clips generated.")
    print(f"📄 Manifest: {manifest_path}")

    # Summary
    total_duration = sum(c["duration"] for c in manifest["clips"].values())
    print(f"⏱️  Total audio: {total_duration:.1f}s ({total_duration/60:.1f} min)")


if __name__ == "__main__":
    asyncio.run(main())
