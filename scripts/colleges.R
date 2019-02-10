library(tidyverse)
library(dplyr)
library(magrittr)
library(jsonlite)

setwd('/Users/jackcondon/Documents/dataviz-comp/data/')

ddata <- read.csv('/Users/jackcondon/Documents/dataviz-comp/data/ipeds_data.csv')
names(ddata) %<>% tolower() 

ndata <- ddata[,1:8] %>% cbind.data.frame(ddata[,73:75])

ddata$pct_undergrad <- ddata$undergraduate.enrollment / ddata$total..enrollment
ddata$pct_grad <- ddata$graduate.enrollment / ddata$total..enrollment
ddata$pct_white <- ((ddata$pct_undergrad * ddata$percent.of.undergraduate.enrollment.that.are.white + ddata$pct_grad * ddata$percent.of.graduate.enrollment.that.are.white) / 2)
ddata$pct_nonwhite <- (100 - ddata$percent.of.total.enrollment.that.are.white) * .01

ndata %<>% cbind.data.frame(ddata$pct_nonwhite) 
ndata %<>% cbind.data.frame(ddata$degree.of.urbanization..urban.centric.locale.)
ndata %<>% cbind.data.frame(ddata$total..enrollment)

# SAT Calculations

ddata %<>% mutate(avg_cr = (sat.critical.reading.75th.percentile.score + sat.critical.reading.25th.percentile.score) / 2) %>%
            mutate(avg_math = (sat.math.75th.percentile.score + sat.math.75th.percentile.score) / 2) %>%
            mutate(avg_sat = round(avg_cr + avg_math))
ndata %<>% cbind.data.frame(ddata$avg_sat)

# ACT
ddata %<>% mutate(avg_act = (act.composite.25th.percentile.score + act.composite.75th.percentile.score) / 2)
ndata %<>% cbind.data.frame(ddata$avg_act)

# Tuition Growth - 3-year CAGR
ddata %<>% mutate(threeyr_cagr = (tuition.and.fees..2013.14 / tuition.and.fees..2010.11)^(1/3) - 1)
ndata %<>% cbind.data.frame(ddata$threeyr_cagr)

# Add selectivity
ndata %<>% cbind.data.frame(ddata$percent.admitted...total)

# Clean up names 
names(ndata)[12:18] <- c('percent_minority', 'cityscape', 'total.enrollment', 'avg_sat', 'tuition_growth', 'admission_rate', 'avg_act')
ndata %<>% mutate(admission_rate = admission_rate * .01)
ndata %<>% mutate(avg_act = round(avg_act))
ndata %<>% select(-year, -geographic.region, -fips.state.code) %>% rename(longitude = longitude.location.of.institution, latitude = latitude.location.of.institution)
ndata %<>% filter(!is.na(avg_act) & !is.na(avg_sat)) %>% filter(total.enrollment > 1000)

write_csv(ndata, 'college.csv')

