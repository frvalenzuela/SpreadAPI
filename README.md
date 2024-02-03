# README - Implementación de REST API para Buda.com

## Mis supuestos

En la realización de esta tarea, se realizaron ciertos supuestos para facilitar la implementación y comprensión del código:

1. Se asumió que los endpoints de la API de Buda.com seguirán las especificaciones presentadas en la documentación proporcionada.
2. Se consideró que los mercados con sufijo ARS pueden ser omitidos, ya que en las pruebas realizadas los resultados fueron arrays vacíos.
3. Se asumió que la precisión proporcionada por la librería decimal.js es suficiente para manejar posibles errores de resta causados por puntos flotantes.
4. Para utilizar la alerta, se supuso que es necesario llamar a un endpoint para establecerla y luego realizar el polling llamando a otro endpoint.

## Dificultades

La principal dificultad se encontró al decidir las herramientas a utilizar. Inicialmente se consideró el uso de Django debido a la documentación en Python. Sin embargo, se optó por Express y TypeScript debido a la familiaridad actual con estas tecnologías y la facilidad de trabajo con funciones lambda en TypeScript.

La elección de las librerías, la configuración del compilador y la definición de las especificaciones fueron más complejas de lo esperado. En retrospectiva, el uso de un framework como Ruby on Rails o Django, que proporcionan una estructura de proyecto predefinida, podría haber optimizado el tiempo de desarrollo.

## Mi Solución

La solución implementada se encuentra en un entorno Docker y ha sido desplegada en un repositorio de AWS, accesible en el siguiente **[URL](https://bbnt5xakfd.us-east-1.awsapprunner.com/api-doc/)**. De igual formar se puede corre en local con docker usando:

```
docker-compose build; docker-compose up
```

Luego revisar el siguiente link :`http://localhost:3000/api-doc`

Consta de cuatro endpoints principales:

-   `/spread/{market_id}`: Devuelve el spread de un mercado específico.
-   `/all`: Devuelve el spread de todos los mercados, excluyendo los mercados con sufijo ARS según los supuestos.
-   `/set-alert/{market_id}/{value}/{type_of_alert}`: Establece una alerta para ser consultada mediante polling.
-   `/alert/{market_id}/{type_of_alert}`: Espera la ocurrencia de la alerta y devuelve un código 200 cuando ocurre el cambio esperado y 304 si no hay cambios.

Cabe mencionar que se cumple con un 100% de branch-coverage para el controllador que opera todas dichas rutas.

## Aspectos a Mejorar

Se identifican áreas de mejora en la implementación, especialmente en la claridad y legibilidad del código, especialmente en la sección de testing. Además, se propone la implementación de interfaces y fábricas para mejorar la estructura del código. Se tiene la intención de crear un script en GitHub Actions para lograr un despliegue automatizado al fusionar en la rama principal. También las descripciones de los errores podrían ser mejores.

## Conclusiones

A pesar de las dificultades en la elección de herramientas, la implementación cumplió con los requisitos establecidos. Se reconoce que una elección más eficiente de herramientas podría haber reducido el tiempo de desarrollo. A pesar de ello, el resultado final es motivo de satisfacción, y se espera que sea suficiente para avanzar en el proceso de selección.
