library(tidyverse)
library(rvest)
library(janitor)
library(glue)
library(scales)
library(grid)
library(ggrepel)

#Sys.setlocale("LC_TIME", "es_ES.utf8")
Sys.setlocale("LC_TIME", "es_ES")


url <- "https://es.wikipedia.org/wiki/Anexo:Presidentes_de_Costa_Rica"
pagina <- read_html(url)

df_presidentes <- pagina |> 
  html_table(trim = TRUE) |> 
  list_rbind() |> 
  select(3,4,5) |> 
  set_names(c("presidente","fecha_inicio","fecha_final")) |> 
  filter(
    !str_detect(presidente,"Primera|Segunda"),
    !str_detect(fecha_inicio,"días|Incumbente|años|meses")
    )


df_presidentes <- separate_wider_regex(
  data = df_presidentes,
  cols = presidente,
  patterns = c(presidente = "[\\w|\\s]+", nacimiento = ".+")
  ) |> 
  mutate(
    nacimiento = str_extract(nacimiento, "\\d+"),
    nacimiento = glue("{nacimiento}-01-01"),
    nacimiento = ymd(nacimiento)
  )

df_presidentes <- df_presidentes |> 
  mutate(
    fecha_inicio = dmy(fecha_inicio),
    fecha_final = dmy(fecha_final)
  )


df_presidentes <- df_presidentes |> 
  mutate(
    edad_inicio = interval(nacimiento, fecha_inicio) %/% years(1),
    edad_final = interval(nacimiento, fecha_final)  %/% years(1),
    duracion = interval(fecha_inicio, fecha_final) %/% years(1)
  ) |> 
  filter(
    duracion >= 4,
    !duplicated(fecha_inicio)
  )


df_presidente_viejos <- df_presidentes |> 
  slice_max(
    edad_inicio,
    n = 5
  )  |> 
  pull(fecha_inicio)

df_presidente_jovenes <- df_presidentes |> 
  slice_min(
    edad_inicio,
    n = 5
  )  |> 
  pull(fecha_inicio)



df_plot <- df_presidentes |> 
  mutate(
    mostrar = if_else(
      condition = fecha_inicio %in% c(df_presidente_viejos, df_presidente_jovenes),
      true = "Mostrar",
      false = "Ocultar"
    ),
    presidente = presidente
  )

df_ajustes <- tribble(
~presidente,                ~ubicacion,    ~nudge_x,   ~nudge_y,   ~direction,
"Juan Rafael Mora Porras"  ,       "up",           0,        2.5,          "y",
"Tomás Guardia Gutiérrez"  ,       "up",           0,        2.5,          "y",
"Bernardo Soto Alfaro"     ,       "up",           0,        2.5,          "y",
"Rafael Iglesias Castro"   ,       "up",           0,        2.5,          "y",
"Ricardo Jiménez Oreamuno" ,     "left",          -2,        -1,          "x",
"Ricardo Jiménez Oreamuno" ,     "left",          -2,        -1,          "x",
"Rafael Iglesias Castro"   ,    "right",           1,        -1,          "x",
)




colours <- c("white","#496989","#496989")
grad_ungroup <- linearGradient(colours, group = FALSE)


ggplot(
  data = df_plot
) +
  geom_rect(
    mapping = aes(
      xmin = fecha_inicio,
      xmax = fecha_inicio + 300,
      ymin = edad_inicio,
      ymax = edad_final
    ),
    fill = grad_ungroup
  )+
  geom_rect(
    mapping = aes(
      xmin = fecha_inicio -300,
      xmax = fecha_inicio + 600,
      ymin = edad_final - 0.1,
      ymax = edad_final + 0.25
    ),
    fill = "#496989"
  ) +
  geom_text_repel(
    mapping = aes(
      x = fecha_inicio,
      y = edad_final,
      label = str_wrap(presidente, 15),
      alpha = mostrar
    ),
    color = "#124076",
    fontface = "bold",
    size = 10/.pt,
    nudge_x = 1,
    direction = "x",
    min.segment.length = 10
  ) +
  scale_x_date(
    date_breaks = "20 years",
    labels = scales::label_date_short()
  ) +

  scale_alpha_manual(
    values = c(
      "Ocultar" = 0,
      "Mostrar" = 1
    )
  ) +
  labs(x = "", y = "") +
  theme_minimal(
    base_size = 14
  ) +
  theme(
    panel.grid.major.x = element_blank(),
    panel.grid.minor.x = element_blank(),
    panel.grid.minor.y = element_blank(),
  )



















ggplot(
  data = df_plot
) +
  geom_rect(
    mapping = aes(
      xmin = fecha_inicio,
      xmax = fecha_inicio + 300,
      ymin = edad_inicio,
      ymax = edad_final
    ),
    fill = grad_ungroup
  )+
  geom_rect(
    mapping = aes(
      xmin = fecha_inicio -300,
      xmax = fecha_inicio + 600,
      ymin = edad_final - 0.1,
      ymax = edad_final + 0.25
    ),
    fill = "#496989"
  ) +
  geom_text(
    mapping = aes(
      x = fecha_inicio,
      y = edad_final,
      label = presidente,
      alpha = mostrar
    ),
    color = "#124076",
    fontface = "bold",
    size = 10/.pt
  ) +
  geom_vline(
    xintercept = ymd("1948-01-01"),
    color = "#B4B4B8",
    linetype = "dashed"
  ) +
  scale_x_date(
    date_breaks = "20 years",
    labels = scales::label_date_short()
  ) +
  scale_y_continuous(
    sec.axis = dup_axis()
  ) +
  scale_alpha_manual(
    values = c(
      "Ocultar" = 0,
      "Mostrar" = 1
    )
  ) +
  annotate(
    x = ymd("1948-12-01"),
    y = 30,
    label = "Segunda República →",
    geom = "label",
    hjust = 0,
    color = "#B4B4B8",
    fontface = "bold",
    size = 14/.pt,
    label.size = NA
  ) +
  labs(x = "", y = "") +
  theme_minimal(
    base_size = 14
  ) +
  theme(
    panel.grid.major.x = element_blank(),
    panel.grid.minor.x = element_blank(),
    panel.grid.minor.y = element_blank(),
  )

