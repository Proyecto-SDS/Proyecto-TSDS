"""
Script de seed para poblar la base de datos con datos iniciales
Basado en los datos del frontend (restaurantsData.ts)
"""

import sys
import os
# Agregar el directorio padre al path para poder importar desde app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import importlib
app_module = importlib.import_module('app')
create_app = getattr(app_module, 'create_app')
db = getattr(app_module, 'db')
models_module = importlib.import_module('app.models')
Rol = getattr(models_module, 'Rol')
Comuna = getattr(models_module, 'Comuna')
Categoria = getattr(models_module, 'Categoria')
TipoFoto = getattr(models_module, 'TipoFoto')
Direccion = getattr(models_module, 'Direccion')
Usuario = getattr(models_module, 'Usuario')
Local = getattr(models_module, 'Local')
Horario = getattr(models_module, 'Horario')
Producto = getattr(models_module, 'Producto')
Mesa = getattr(models_module, 'Mesa')
Redes = getattr(models_module, 'Redes')
Foto = getattr(models_module, 'Foto')
from datetime import time

def seed_database():
    """Función principal para sembrar la base de datos"""
    
    app = create_app()
    
    with app.app_context():
        print("Iniciando seed de la base de datos...")
        
        # Limpiar datos existentes (opcional - comentar si no quieres borrar)
        # print("Limpiando datos existentes...")
        # db.drop_all()
        # db.create_all()
        
        # 1. Crear Roles
        print("Creando roles...")
        roles_data = ['administrador', 'cliente', 'mesero', 'cocinero', 'gerente']
        roles = {}
        for rol_nombre in roles_data:
            rol = Rol.query.filter_by(nombre=rol_nombre).first()
            if not rol:
                rol = Rol(nombre=rol_nombre)
                db.session.add(rol)
                roles[rol_nombre] = rol
        db.session.commit()
        print(f"   ✓ {len(roles_data)} roles creados")
        
        # 2. Crear Comunas
        print("🏘Creando comunas...")
        comunas_data = [
            'Santiago Centro', 'Miraflores', 'Barranco', 'San Isidro',
            'Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa'
        ]
        comunas = {}
        for comuna_nombre in comunas_data:
            comuna = Comuna.query.filter_by(nombre=comuna_nombre).first()
            if not comuna:
                comuna = Comuna(nombre=comuna_nombre)
                db.session.add(comuna)
                comunas[comuna_nombre] = comuna
        db.session.commit()
        print(f"   ✓ {len(comunas_data)} comunas creadas")
        
        # 3. Crear Categorías de productos
        print("Creando categorías...")
        categorias_data = [
            'Platos Principales', 'Entradas', 'Bebidas', 'Postres',
            'Bebidas Calientes', 'Bebidas Frías', 'Repostería', 
            'Desayunos', 'Brunch'
        ]
        categorias = {}
        for cat_nombre in categorias_data:
            categoria = Categoria.query.filter_by(nombre=cat_nombre).first()
            if not categoria:
                categoria = Categoria(nombre=cat_nombre)
                db.session.add(categoria)
                categorias[cat_nombre] = categoria
        db.session.commit()
        print(f"   ✓ {len(categorias_data)} categorías creadas")
        
        # 4. Crear Tipos de Foto
        print(" Creando tipos de foto...")
        tipos_foto_data = ['perfil', 'galeria', 'menu', 'ambiente']
        tipos_foto = {}
        for tipo_nombre in tipos_foto_data:
            tipo = TipoFoto.query.filter_by(nombre=tipo_nombre).first()
            if not tipo:
                tipo = TipoFoto(nombre=tipo_nombre)
                db.session.add(tipo)
                tipos_foto[tipo_nombre] = tipo
        db.session.commit()
        print(f"   ✓ {len(tipos_foto_data)} tipos de foto creados")
        
        # 5. Crear Usuarios de ejemplo
        print("Creando usuarios de ejemplo...")
        rol_cliente = Rol.query.filter_by(nombre='cliente').first()
        rol_admin = Rol.query.filter_by(nombre='administrador').first()
        
        usuarios_data = [
            {
                'nombre': 'Juan Pérez',
                'correo': 'juan.perez@example.com',
                'contrasena': 'password123',  # En producción debe estar hasheada
                'telefono': '987654321',
                'rol': rol_cliente
            },
            {
                'nombre': 'María García',
                'correo': 'maria.garcia@example.com',
                'contrasena': 'password123',
                'telefono': '987654322',
                'rol': rol_cliente
            },
            {
                'nombre': 'Admin ReservaYa',
                'correo': 'admin@reservaya.com',
                'contrasena': 'admin123',
                'telefono': '999999999',
                'rol': rol_admin
            }
        ]
        
        for user_data in usuarios_data:
            usuario = Usuario.query.filter_by(correo=user_data['correo']).first()
            if not usuario:
                usuario = Usuario(
                    id_rol=user_data['rol'].id,
                    nombre=user_data['nombre'],
                    correo=user_data['correo'],
                    contrasena=user_data['contrasena'],
                    telefono=user_data['telefono']
                )
                db.session.add(usuario)
        db.session.commit()
        print(f"   ✓ {len(usuarios_data)} usuarios creados")
        
        # 6. Crear Restaurantes con sus datos completos
        print("🍽Creando restaurantes...")
        
        restaurantes_data = [
            {
                'nombre': 'King Halo',
                'tipo': 'Restaurante',
                'telefono': 987654001,
                'correo': 'contacto@kinghalo.com',
                'descripcion': 'Restaurante de cocina internacional con los mejores platos del mundo',
                'direccion': {
                    'comuna': 'Santiago Centro',
                    'numero': 123,
                    'latitud': -33.4489,
                    'longitud': -70.6693
                },
                'horarios': [
                    {'dia': 1, 'apertura': '11:00', 'cierre': '22:00'},
                    {'dia': 2, 'apertura': '11:00', 'cierre': '22:00'},
                    {'dia': 3, 'apertura': '11:00', 'cierre': '22:00'},
                    {'dia': 4, 'apertura': '11:00', 'cierre': '22:00'},
                    {'dia': 5, 'apertura': '11:00', 'cierre': '23:00'},
                    {'dia': 6, 'apertura': '11:00', 'cierre': '23:00'},
                    {'dia': 7, 'apertura': '12:00', 'cierre': '22:00'},
                ],
                'productos': [
                    {'nombre': 'Paella Valenciana', 'descripcion': 'Arroz con mariscos frescos, azafrán y vegetales', 'precio': 45000, 'categoria': 'Platos Principales'},
                    {'nombre': 'Cerveza Artesanal', 'descripcion': 'Cerveza local IPA 500ml', 'precio': 12000, 'categoria': 'Bebidas'},
                    {'nombre': 'Tabla de Mariscos', 'descripcion': 'Variedad de mariscos frescos para compartir', 'precio': 38000, 'categoria': 'Entradas'},
                    {'nombre': 'Pulpo a la Gallega', 'descripcion': 'Pulpo tierno con papas y pimentón', 'precio': 32000, 'categoria': 'Platos Principales'},
                ]
            },
            {
                'nombre': 'La Paella Real',
                'tipo': 'Restobar',
                'telefono': 987654002,
                'correo': 'info@lapaellareal.com',
                'descripcion': 'Restobar español con las mejores paellas y tapas de la ciudad',
                'direccion': {
                    'comuna': 'Miraflores',
                    'numero': 456,
                    'latitud': -33.4172,
                    'longitud': -70.6040
                },
                'horarios': [
                    {'dia': 1, 'apertura': '12:00', 'cierre': '23:00'},
                    {'dia': 2, 'apertura': '12:00', 'cierre': '23:00'},
                    {'dia': 3, 'apertura': '12:00', 'cierre': '23:00'},
                    {'dia': 4, 'apertura': '12:00', 'cierre': '23:00'},
                    {'dia': 5, 'apertura': '12:00', 'cierre': '00:00'},
                    {'dia': 6, 'apertura': '12:00', 'cierre': '00:00'},
                    {'dia': 7, 'apertura': '12:00', 'cierre': '22:00'},
                ],
                'productos': [
                    {'nombre': 'Paella Mixta', 'descripcion': 'Arroz con pollo, mariscos y chorizo español', 'precio': 42000, 'categoria': 'Platos Principales'},
                    {'nombre': 'Sangría de la Casa', 'descripcion': 'Vino tinto con frutas frescas - 1 litro', 'precio': 28000, 'categoria': 'Bebidas'},
                    {'nombre': 'Jamón Ibérico', 'descripcion': 'Jamón curado con pan y tomate', 'precio': 35000, 'categoria': 'Entradas'},
                    {'nombre': 'Patatas Bravas', 'descripcion': 'Papas crujientes con salsa brava', 'precio': 18000, 'categoria': 'Entradas'},
                ]
            },
            {
                'nombre': 'Café del Mar',
                'tipo': 'Cafetería',
                'telefono': 987654003,
                'correo': 'hola@cafedelmar.com',
                'descripcion': 'Cafetería con vista al mar, especialidad en café de altura y repostería artesanal',
                'direccion': {
                    'comuna': 'Barranco',
                    'numero': 789,
                    'latitud': -33.4569,
                    'longitud': -70.6483
                },
                'horarios': [
                    {'dia': 1, 'apertura': '08:00', 'cierre': '20:00'},
                    {'dia': 2, 'apertura': '08:00', 'cierre': '20:00'},
                    {'dia': 3, 'apertura': '08:00', 'cierre': '20:00'},
                    {'dia': 4, 'apertura': '08:00', 'cierre': '20:00'},
                    {'dia': 5, 'apertura': '08:00', 'cierre': '21:00'},
                    {'dia': 6, 'apertura': '08:00', 'cierre': '21:00'},
                    {'dia': 7, 'apertura': '09:00', 'cierre': '20:00'},
                ],
                'productos': [
                    {'nombre': 'Cappuccino Premium', 'descripcion': 'Café espresso con leche vaporizada y espuma', 'precio': 12000, 'categoria': 'Bebidas Calientes'},
                    {'nombre': 'Croissant de Almendras', 'descripcion': 'Croissant francés relleno de crema de almendras', 'precio': 8000, 'categoria': 'Repostería'},
                    {'nombre': 'Frappé de Caramelo', 'descripcion': 'Bebida helada con café, caramelo y crema', 'precio': 15000, 'categoria': 'Bebidas Frías'},
                    {'nombre': 'Tostadas Francesas', 'descripcion': 'Pan brioche con frutas y miel de maple', 'precio': 22000, 'categoria': 'Desayunos'},
                ]
            },
            {
                'nombre': 'El Cóndor Pasa',
                'tipo': 'Restaurante',
                'telefono': 987654004,
                'correo': 'reservas@condorpasa.com',
                'descripcion': 'Auténtico restaurante peruano con lo mejor de la gastronomía andina y criolla',
                'direccion': {
                    'comuna': 'Santiago Centro',
                    'numero': 234,
                    'latitud': -33.4378,
                    'longitud': -70.6504
                },
                'horarios': [
                    {'dia': 1, 'apertura': '12:00', 'cierre': '22:00'},
                    {'dia': 2, 'apertura': '12:00', 'cierre': '22:00'},
                    {'dia': 3, 'apertura': '12:00', 'cierre': '22:00'},
                    {'dia': 4, 'apertura': '12:00', 'cierre': '22:00'},
                    {'dia': 5, 'apertura': '12:00', 'cierre': '23:00'},
                    {'dia': 6, 'apertura': '12:00', 'cierre': '23:00'},
                    {'dia': 7, 'apertura': '12:00', 'cierre': '22:00'},
                ],
                'productos': [
                    {'nombre': 'Ceviche Clásico', 'descripcion': 'Pescado fresco en leche de tigre con camote y choclo', 'precio': 35000, 'categoria': 'Entradas'},
                    {'nombre': 'Lomo Saltado', 'descripcion': 'Carne de res salteada con cebolla, tomate y papas fritas', 'precio': 38000, 'categoria': 'Platos Principales'},
                    {'nombre': 'Ají de Gallina', 'descripcion': 'Pollo deshilachado en salsa de ají amarillo con arroz', 'precio': 32000, 'categoria': 'Platos Principales'},
                    {'nombre': 'Chicha Morada', 'descripcion': 'Bebida tradicional de maíz morado con frutas', 'precio': 8000, 'categoria': 'Bebidas'},
                    {'nombre': 'Anticuchos de Corazón', 'descripcion': 'Brochetas de corazón marinadas con papas y choclo', 'precio': 28000, 'categoria': 'Entradas'},
                    {'nombre': 'Pisco Sour', 'descripcion': 'Cóctel tradicional peruano con pisco, limón y clara', 'precio': 18000, 'categoria': 'Bebidas'},
                ]
            },
            {
                'nombre': 'Manhattan Caffe',
                'tipo': 'Cafetería',
                'telefono': 987654005,
                'correo': 'hello@manhattancaffe.com',
                'descripcion': 'Cafetería urbana estilo neoyorquino con café de especialidad y brunch todo el día',
                'direccion': {
                    'comuna': 'San Isidro',
                    'numero': 567,
                    'latitud': -33.4232,
                    'longitud': -70.6156
                },
                'horarios': [
                    {'dia': 1, 'apertura': '07:00', 'cierre': '21:00'},
                    {'dia': 2, 'apertura': '07:00', 'cierre': '21:00'},
                    {'dia': 3, 'apertura': '07:00', 'cierre': '21:00'},
                    {'dia': 4, 'apertura': '07:00', 'cierre': '21:00'},
                    {'dia': 5, 'apertura': '07:00', 'cierre': '22:00'},
                    {'dia': 6, 'apertura': '08:00', 'cierre': '22:00'},
                    {'dia': 7, 'apertura': '08:00', 'cierre': '21:00'},
                ],
                'productos': [
                    {'nombre': 'Flat White', 'descripcion': 'Espresso doble con microespuma de leche sedosa', 'precio': 14000, 'categoria': 'Bebidas Calientes'},
                    {'nombre': 'New York Cheesecake', 'descripcion': 'Tarta de queso cremosa estilo Nueva York con coulis de frutos rojos', 'precio': 16000, 'categoria': 'Postres'},
                    {'nombre': 'Bagel Manhattan', 'descripcion': 'Bagel con salmón ahumado, queso crema y alcaparras', 'precio': 24000, 'categoria': 'Brunch'},
                    {'nombre': 'Iced Latte Caramelo', 'descripcion': 'Café latte frío con caramelo y leche de avena', 'precio': 16000, 'categoria': 'Bebidas Frías'},
                    {'nombre': 'Pancakes Americanos', 'descripcion': 'Torre de pancakes con maple, mantequilla y frutos rojos', 'precio': 26000, 'categoria': 'Brunch'},
                    {'nombre': 'Cold Brew', 'descripcion': 'Café extraído en frío por 18 horas, servido con hielo', 'precio': 13000, 'categoria': 'Bebidas Frías'},
                ]
            }
        ]
        
        for rest_data in restaurantes_data:
            # Verificar si el local ya existe
            local_existente = Local.query.filter_by(nombre=rest_data['nombre']).first()
            if local_existente:
                print(f"   ⚠{rest_data['nombre']} ya existe, saltando...")
                continue
            
            # Crear dirección
            comuna = Comuna.query.filter_by(nombre=rest_data['direccion']['comuna']).first()
            direccion = Direccion(
                id_comuna=comuna.id,
                numero=rest_data['direccion']['numero'],
                latitud=rest_data['direccion']['latitud'],
                longitud=rest_data['direccion']['longitud']
            )
            db.session.add(direccion)
            db.session.flush()
            
            # Crear local
            local = Local(
                id_direccion=direccion.id,
                nombre=rest_data['nombre'],
                tipo=rest_data.get('tipo'),
                telefono=rest_data['telefono'],
                correo=rest_data['correo']
            )
            db.session.add(local)
            db.session.flush()
            
            # Crear horarios
            for horario_data in rest_data['horarios']:
                horario = Horario(
                    id_local=local.id,
                    dia_semana=horario_data['dia'],
                    hora_apertura=time.fromisoformat(horario_data['apertura']),
                    hora_cierre=time.fromisoformat(horario_data['cierre']),
                    abierto=True
                )
                db.session.add(horario)
            
            # Crear productos
            for prod_data in rest_data['productos']:
                categoria = Categoria.query.filter_by(nombre=prod_data['categoria']).first()
                producto = Producto(
                    id_local=local.id,
                    id_categoria=categoria.id,
                    nombre=prod_data['nombre'],
                    descripcion=prod_data['descripcion'],
                    precio=prod_data['precio'],
                    estado='disponible',
                    disponible=True
                )
                db.session.add(producto)
            
            # Crear mesas de ejemplo (4-8 mesas por local)
            num_mesas = 6
            for i in range(1, num_mesas + 1):
                mesa = Mesa(
                    id_local=local.id,
                    nombre=f'Mesa {i}',
                    capacidad=2 if i <= 2 else (4 if i <= 5 else 6),
                    estado='disponible'
                )
                db.session.add(mesa)
            
            print(f"   ✓ {rest_data['nombre']} creado con {len(rest_data['productos'])} productos y {num_mesas} mesas")
        
        db.session.commit()
        print(f"   ✓ {len(restaurantes_data)} restaurantes creados")
        
        print("\n¡Seed completado exitosamente!")
        print("\nResumen:")
        print(f"   - Roles: {Rol.query.count()}")
        print(f"   - Comunas: {Comuna.query.count()}")
        print(f"   - Categorías: {Categoria.query.count()}")
        print(f"   - Usuarios: {Usuario.query.count()}")
        print(f"   - Locales: {Local.query.count()}")
        print(f"   - Productos: {Producto.query.count()}")
        print(f"   - Mesas: {Mesa.query.count()}")
        print(f"   - Horarios: {Horario.query.count()}")

if __name__ == '__main__':
    seed_database()
