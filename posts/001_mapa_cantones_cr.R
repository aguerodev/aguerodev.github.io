library(tidyverse)
library(sf)
library(geojsonsf)
library(httr2)
library(ows4R)
library(rmapshaper)
library(janitor)
library(ggokabeito)


# Descargar datos y guardar localmente ------------------------------------
# se ejecuta solamente una vez o cada que se quiera actualizar el GeoJSON


url_wfs <- "https://geos.snitcr.go.cr/be/IGN_5_CO/wfs?"

bwk_client <- WFSClient$new(
  url = url_wfs,
  serviceVersion = "2.0.0"
)

as_tibble(bwk_client$getFeatureTypes(pretty = TRUE))

## Descargar Cantones
url <- url_parse(url_wfs)
url$query <- list(
  service = "wfs",
  request = "GetFeature",
  typename = "IGN_5_CO:limitecantonal_5k",
  srsName = "EPSG:4326"
)
request <- url_build(url) 

regiones <- read_sf(request) |> 
  select(
    "CÓDIGO_DE_PROVINCIA",
    "PROVINCIA","CÓDIGO_CANTÓN","CANTÓN"
  )
st_crs(regiones) <- st_crs(4326)

# Simplificar mapa
regiones_simplificadas <- ms_simplify(
  input = regiones,
  keep = 0.05,
  keep_shapes = FALSE
)

# eliminar la isla del coco
regiones_simplificadas <- ms_filter_islands(
  input = regiones_simplificadas,
  min_area = 24000000
)

# guardar localmente
write_sf(regiones_simplificadas, "cantones_cr.geojson")

# Gráfico resultados ------------------------------------------------------

cantones <- st_read(
  dsn = "cantones_cr.geojson",
  quiet = TRUE
) |> 
  clean_names()

resultados <- read_csv("https://github.com/aguerodev/aguerodev.github.io/raw/main/posts/elecciones_municipales_2024.csv")

resultados_tse <- resultados_tse |> 
  mutate(
    canton = if_else(
      canton == "León Cortés",
      "León Cortés Castro",
      canton
    )
  )

mapa <- left_join(
  x = cantones,
  y = resultados_tse,
  by = join_by(canton == canton)
)

mapa <- mapa |>
  mutate(
    ganador = fct_lump_min(ganador, min = 5,
                           other_level = "Otros")
  )



ggplot(
  data = mapa,
  mapping = aes(
    fill = ganador
  )
) +
  geom_sf(color = "white", linewidth = 0.5) +
  scale_fill_okabe_ito() +
  theme_minimal() +
  theme(
    legend.position = "bottom"
  )