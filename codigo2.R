library(readxl)
library(dplyr)
library(gt)
library(ggplot2)

datos <- read_xlsx("datos/Ejercicios tema 3.xlsx")

moda <- function(x) as.numeric(names(sort(table(x), decreasing = TRUE)[1]))

calcular_freq <- function(x, var){
  count(datos, var ={{var}}, name = "freq_absoluta") |>
    mutate(
      freq_relativa = freq_absoluta / sum(freq_absoluta),
      fr_percent = freq_relativa,
      space = ""
    )
}


x <- calcular_freq(datos, Edad)
gt(x) |>
  tab_header(
    title = md("Cuadro 1<br>**Distribución de frecuencias para la variable Edad**"),
  ) |>
  tab_spanner(label = md("**Frecuencias**"), columns = -c(1,5)) |>
  cols_label(
    var = md("**Edad**"),
    freq_absoluta = md("**Absoluta**"),
    freq_relativa = md("**Relativa**"),
    fr_percent = md("**Relativa %**"),
    space = ""
  ) |>
  tab_style(
    style = list(cell_text(align = "left")),
    locations = cells_title()
  ) |>
  tab_style(
    style = cell_text(align = "center", weight = "bold"),
    locations = cells_column_labels()
  ) |>
  tab_style(
    style = cell_text(align = "center"),
    locations = cells_body(columns = where(is.numeric))
  ) |>
  tab_options(
    heading.title.font.size = px(16),
    heading.subtitle.font.size = px(10),
    column_labels.font.size = px(14),
    stub.font.size = px(14),
    table.font.size = px(14),
    table.border.left.width = px(0),
    table.border.left.style = "none",
    table.border.right.width = px(0),
    table.border.right.style = "none",
    table.border.top.width = px(0),
    table.border.bottom.width = px(0),
    column_labels.border.top.width = px(0),
    column_labels.border.top.color = "black",
    column_labels.border.bottom.width = px(1.5),
    column_labels.border.bottom.style = "solid",
    column_labels.border.bottom.color = "black",
    heading.border.bottom.width = px(0),
    column_labels.background.color = "#e3e1ba",
    column_labels.padding = px(10),
    data_row.padding.horizontal = px(10),
    stub.border.width = px(0),
    table_body.hlines.width = px(2),
    table_body.hlines.color = "white",
    table_body.border.top.color = "black",
    table_body.border.bottom.color = "black",
    table_body.border.bottom.width = px(0),
    footnotes.spec_ref = "^",
    footnotes.spec_ftr = " ",

  ) |>
  sub_missing(missing_text = "ND") |>
  fmt_number(freq_relativa, decimals = 2) |>
  fmt_percent(fr_percent,decimals = 2 ) |>
  cols_width(
    var ~ px(100),
    freq_absoluta ~ px(100),
    freq_relativa ~ px(100),
    fr_percent ~ px(100),
    space = ~ px(20)
  )

gtsave(tabla, "tabla.png")


resumen <- function(x, .var){
  summarise(
    x,
    media = mean({{.var}}),
    median = median({{.var}}),
    min = min({{.var}}),
    max = max({{.var}}),
    moda = moda({{.var}}),
    rango = paste0(range({{.var}}), collapse = "-"),
    varianza = var({{.var}}),
    desviacion_estandar = sd({{.var}}),
    space = ""
  )
}

x <- resumen(datos, Edad)
tabla <- gt(x) |>
  tab_header(
    title = md("Cuadro 1<br>**Resumen de la variable Edad**"),
  ) |>
  cols_label(
    media = "Media",
    median = "Mediana",
    min = "Mínimo",
    max = "Máximo",
    moda = "Moda",
    rango = html("Rango<br>(min-max)"),
    varianza = "Varianza",
    desviacion_estandar = html("Desviacion<br>Estandar"),
    space = ""
  ) |>
  tab_style(
    style = list(cell_text(align = "left")),
    locations = cells_title()
  ) |>
  tab_style(
    style = cell_text(align = "center", weight = "bold"),
    locations = cells_column_labels()
  ) |>
  tab_style(
    style = cell_text(align = "center"),
    locations = cells_body(columns = everything())
  ) |>
  tab_options(
    heading.title.font.size = px(16),
    heading.subtitle.font.size = px(10),
    column_labels.font.size = px(14),
    stub.font.size = px(14),
    table.font.size = px(14),
    table.border.left.width = px(0),
    table.border.left.style = "none",
    table.border.right.width = px(0),
    table.border.right.style = "none",
    table.border.top.width = px(0),
    table.border.bottom.width = px(0),
    column_labels.border.top.width = px(0),
    column_labels.border.top.color = "black",
    column_labels.border.bottom.width = px(1.5),
    column_labels.border.bottom.style = "solid",
    column_labels.border.bottom.color = "black",
    heading.border.bottom.width = px(0),
    column_labels.background.color = "#e3e1ba",
    column_labels.padding = px(10),
    data_row.padding.horizontal = px(10),
    stub.border.width = px(0),
    table_body.hlines.width = px(4),
    table_body.hlines.color = "white",
    table_body.border.top.color = "black",
    table_body.border.bottom.color = "black",
    table_body.border.bottom.width = px(0),
    footnotes.spec_ref = "^",
    footnotes.spec_ftr = " "
  ) |>
  sub_missing(missing_text = "ND") |>
  fmt_number(where(is.numeric), decimals = 2) |>
  cols_width(
    space ~ px(10)
  )

gtsave(tabla, "tabla.png")


grafico_boxplot <- function(x, .var, title = ""){
  library(ggplot2)
  ggplot(
    data = x,
    mapping = aes(
      y = {{.var}}
    )
  ) +
    labs(title = title) +
    geom_boxplot(fill = "steelblue") +
    theme_minimal()
}

grafico_boxplot(datos, Edad)

interpretacion_boxplot <- function(data, var) {
  stopifnot(is.data.frame(data))

  # Estadísticos básicos
  s <- dplyr::summarise(
    data,
    mediana    = median({{ var }}, na.rm = TRUE),
    q1         = quantile({{ var }}, .25, na.rm = TRUE),
    q3         = quantile({{ var }}, .75, na.rm = TRUE),
    iqr        = IQR({{ var }}, na.rm = TRUE),
    whisk_low  = boxplot.stats({{ var }})$stats[1],
    whisk_high = boxplot.stats({{ var }})$stats[5],
    outliers   = list(boxplot.stats({{ var }})$out)
  )

  # Redondeo
  med   <- round(s$mediana, 1)
  q1    <- round(s$q1, 1)
  q3    <- round(s$q3, 1)
  iqr   <- round(s$iqr, 1)
  low   <- round(s$whisk_low, 1)
  high  <- round(s$whisk_high, 1)

  # Dispersión
  disp <- dplyr::case_when(
    s$iqr < 0.10 * s$mediana ~ "baja",
    s$iqr < 0.30 * s$mediana ~ "moderada",
    TRUE                     ~ "alta"
  )

  # Sesgo
  skew <- if (s$mediana - s$q1 > s$q3 - s$mediana)
    "hacia valores más bajos"
  else
    "hacia valores más altos"

  # Atípicos
  out_vals <- s$outliers[[1]]
  n_out    <- length(out_vals)
  out_dir  <- if (n_out && mean(out_vals) > s$mediana) " superiores" else " inferiores"
  out_txt  <- if (n_out)
    glue::glue(" Se identifican {n_out} valores atípicos{out_dir}.")
  else
    ""

  # Párrafo final
  glue::glue(
    "La mediana (Q2) es {med}. El 50% se ubica entre {q1} (Q1) y {q3} (Q3), "
    , "con un rango intercuartilico de {iqr}, con una dispersión {disp}. "
    , "Los 'bigotes' se extienden de {low} hasta {high}.{out_txt} "
    , "La mediana sugiere un sesgo {skew}."
  )
}



interpretacion_boxplot(datos, Edad)

interpretacion_histograma <- function(data, var) {
  stopifnot(is.data.frame(data))

  # Estadísticos básicos
  s <- dplyr::summarise(
    data,
    media   = mean({{ var }}, na.rm = TRUE),
    mediana = median({{ var }}, na.rm = TRUE),
    moda    = moda({{ var }}),                       # requiere función `moda()`
    sd      = sd({{ var }},   na.rm = TRUE),
    min     = min({{ var }},  na.rm = TRUE),
    max     = max({{ var }},  na.rm = TRUE)
  )

  # Redondear para la redacción
  media   <- round(s$media,   1)
  mediana <- round(s$mediana, 1)
  moda    <- round(s$moda,    1)
  sd      <- round(s$sd,      1)
  xmin    <- round(s$min,     1)
  xmax    <- round(s$max,     1)

  # Asimetría
  skew_txt <- dplyr::case_when(
    abs(s$media - s$mediana) < 0.05 * s$sd ~ "una distribución prácticamente simétrica",
    s$media > s$mediana                    ~ "una cola algo más larga hacia la derecha (asimetría positiva)",
    TRUE                                   ~ "una cola algo más larga hacia la izquierda (asimetría negativa)"
  )

  # Dispersión (coeficiente de variación)
  cv <- s$sd / abs(s$media)
  disp_txt <- dplyr::case_when(
    cv < 0.10 ~ "muy concentrados en torno al promedio",
    cv < 0.30 ~ "moderadamente dispersos",
    TRUE      ~ "bastante dispersos"
  )

  # Párrafo final
  glue::glue(
    "La distribución presenta un pico principal cerca de {moda}. ",
    "La media es {media} y la mediana {mediana}, lo que indica {skew_txt}. ",
    "Los datos están {disp_txt} con una desviación estándar de {sd}. ",
    "El rango observado va de {xmin} a {xmax}."
  )
}



grafico_histograma <- function(x, .var, title = ""){
  library(ggplot2)
  ggplot(
    data = x,
    mapping = aes(
      x = {{.var}}
    )
  ) +
    labs(title = title) +
    geom_histogram(fill = "steelblue", color = "white") +
    theme_minimal()
}

grafico_histograma(datos, Edad)
interpretacion_histograma(datos, Edad)


