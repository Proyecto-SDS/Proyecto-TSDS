# Scripts

## seed.py

Pobla la base de datos con datos iniciales de prueba.

### Uso

```powershell
python -m pipenv run python scripts/seed.py
```

### Datos creados

- 5 roles
- 8 comunas
- 9 categorías
- 3 usuarios de ejemplo
- 5 restaurantes completos
- 24 productos
- 30 mesas
- 35 horarios

### Notas

- Ejecutar después de crear el schema SQL
- Se puede ejecutar múltiples veces sin duplicar datos
