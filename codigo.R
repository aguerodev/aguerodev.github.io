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
