# Modelo de Dominio  
**Hospital de Las Flores | Servicio de Hemoterapia**

---

## 1. Jerarquía de Herencia

### `Persona` *(Clase Abstracta)*

| Atributo | Tipo | Descripción |
|---|---|---|
| DNI | String | Identificador único |
| nombre | String | Nombre |
| apellido | String | Apellido |
| fechaNacimiento | Date | Fecha de nacimiento |
| direccion | String | Domicilio |
| telefono | String | Contacto |
| grupoSanguineo | GrupoSanguineo | Tipo ABO + Rh (normalizado) |

---

### `Donante` *(hereda de Persona)*

| Atributo | Tipo |
|---|---|
| semaforoAptitud | EstadoAptitud |

---

### `Paciente` *(hereda de Persona)*

---

### `Gestante` *(hereda de Persona)*

| Atributo | Tipo |
|---|---|
| antecedentesObstetricos | String |

---

### `RecienNacido` *(hereda de Persona)*

| Atributo | Tipo |
|---|---|
| pruebaCoombsDirecta | ResultadoCoombs |

---

## 2. Eventos y Transacciones

### `Donacion`

| Atributo | Tipo |
|---|---|
| fecha | Date |
| peso | Float |
| tensionArterial | String |
| hemoglobina | Float |
| resultadoSerologia | ResultadoSerologia |
| reaccionAdversa | String |
| tipoDonacion | String |

---

### `Transfusion`

| Atributo | Tipo |
|---|---|
| fecha | Date |
| componente | TipoHemocomponente |
| cantidadUnidades | Int |
| pruebaCoombsDirecta | ResultadoCoombs |
| compatibilidad | CompatibilidadTransfusional |
| reaccionAdversa | String |

---

### `EstudioGestante`

| Atributo | Tipo |
|---|---|
| fecha | Date |
| pruebaCoombsIndirecta | ResultadoCoombs |
| compatibilidadConyugal | String |
| estadoEstudio | String |

---

## 3. Value Objects

### `GrupoSanguineo`

| Atributo | Tipo |
|---|---|
| tipo | TipoABO |
| factorRh | FactorRh |

---

### `ResultadoSerologia`

| Atributo | Tipo |
|---|---|
| hiv | Boolean |
| hcv | Boolean |
| hbv | Boolean |
| chagas | Boolean |
| sifilis | Boolean |

---

### `ResultadoCoombs`

| Atributo | Tipo |
|---|---|
| tipo | TipoCoombs |
| positivo | Boolean |

---

### `CompatibilidadTransfusional`

| Atributo | Tipo |
|---|---|
| donante | GrupoSanguineo |
| receptor | GrupoSanguineo |
| compatible | Boolean |
| motivoIncompatibilidad | String |

---

## 4. Enumeraciones

### `EstadoAptitud`

| Valor |
|---|
| VERDE |
| AMARILLO |
| ROJO |

---

### `TipoHemocomponente`

| Valor |
|---|
| GLOBULOS_ROJOS |
| PLASMA |
| PLAQUETAS |
| CRIOPRECIPITADO |

---

### `TipoABO`

| Valor |
|---|
| A |
| B |
| AB |
| O |

---

### `FactorRh`

| Valor |
|---|
| POSITIVO |
| NEGATIVO |

---

### `TipoCoombs`

| Valor |
|---|
| DIRECTO |
| INDIRECTO |

---

## 5. Diagrama de Clases (Mermaid)

```mermaid
classDiagram

class Persona {
  <<abstract>>
  +String DNI
  +String nombre
  +String apellido
  +Date fechaNacimiento
  +String direccion
  +String telefono
  +GrupoSanguineo grupoSanguineo
}

class Donante {
  +EstadoAptitud semaforoAptitud
}

class Paciente {}

class Gestante {
  +String antecedentesObstetricos
}

class RecienNacido {
  +ResultadoCoombs pruebaCoombsDirecta
}

class Donacion {
  +Date fecha
  +Float peso
  +String tensionArterial
  +Float hemoglobina
  +ResultadoSerologia resultadoSerologia
  +String reaccionAdversa
  +String tipoDonacion
}

class Transfusion {
  +Date fecha
  +TipoHemocomponente componente
  +Int cantidadUnidades
  +ResultadoCoombs pruebaCoombsDirecta
  +CompatibilidadTransfusional compatibilidad
  +String reaccionAdversa
}

class EstudioGestante {
  +Date fecha
  +ResultadoCoombs pruebaCoombsIndirecta
  +String compatibilidadConyugal
  +String estadoEstudio
}

class GrupoSanguineo {
  +TipoABO tipo
  +FactorRh rh
}

class ResultadoSerologia {
  +Boolean hiv
  +Boolean hcv
  +Boolean hbv
  +Boolean chagas
  +Boolean sifilis
}

class ResultadoCoombs {
  +TipoCoombs tipo
  +Boolean positivo
}

class CompatibilidadTransfusional {
  +GrupoSanguineo donante
  +GrupoSanguineo receptor
  +Boolean compatible
  +String motivoIncompatibilidad
}

class EstadoAptitud {
  <<enumeration>>
  VERDE
  AMARILLO
  ROJO
}

class TipoHemocomponente {
  <<enumeration>>
  GLOBULOS_ROJOS
  PLASMA
  PLAQUETAS
  CRIOPRECIPITADO
}

class TipoABO {
  <<enumeration>>
  A
  B
  AB
  O
}

class FactorRh {
  <<enumeration>>
  POSITIVO
  NEGATIVO
}

class TipoCoombs {
  <<enumeration>>
  DIRECTO
  INDIRECTO
}

Persona <|-- Donante
Persona <|-- Paciente
Persona <|-- Gestante
Persona <|-- RecienNacido

Donante "1" *-- "0..*" Donacion : realiza
Paciente "1" *-- "0..*" Transfusion : recibe
Gestante "1" *-- "0..*" EstudioGestante : se somete a
Gestante "1" o-- "0..*" RecienNacido : da a luz

Donante --> EstadoAptitud
Transfusion --> TipoHemocomponente