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
            mutate(avg_math = (sat.math.75th.percentile.score + sat.math.25th.percentile.score) / 2) %>%
            mutate(avg_sat = round(avg_cr + avg_math))
ndata %<>% cbind.data.frame(ddata$avg_sat)

# ACT
ddata %<>% mutate(avg_act = (act.composite.25th.percentile.score + act.composite.75th.percentile.score) / 2)
ndata %<>% cbind.data.frame(round(ddata$avg_act))

# Tuition Growth - 3-year CAGR
ddata %<>% mutate(tmp = ((tuition.and.fees..2013.14 / tuition.and.fees..2010.11)^(1/3) - 1))
ddata %<>% mutate(threeyr_cagr = ifelse(is.na(tmp), 0, tmp)) %>% select(-tmp)
ndata %<>% cbind.data.frame(ddata$threeyr_cagr)

# Add selectivity
ddata %<>% mutate(percent.admitted...total = ifelse(is.na(percent.admitted...total), 0, percent.admitted...total))
ndata %<>% cbind.data.frame(ddata$percent.admitted...total)

# Clean up names 
names(ndata)[12:18] <- c('percent_minority', 'cityscape', 'total.enrollment', 'avg_sat', 'avg_act', 'three_year_tuition_growth', 'admission_rate')
ndata %<>% select(-year, -geographic.region, -fips.state.code) %>% rename(longitude = longitude.location.of.institution, latitude = latitude.location.of.institution)

# select colleges 
ndata %<>% filter(!is.na(avg_act) & !is.na(avg_sat) & !is.na(three_year_tuition_growth) & !is.na(total.enrollment) & !is.na(admission_rate)) %>% filter(total.enrollment > 1000) %>% filter(state.abbreviation != 'Hawaii')

# format
ndata[,14] <- round(ndata[,14] * 100, 1)
ndata[,14] %<>% paste0(., "%")

ndata[,15] %<>% paste0(., "%")

#system("rm college.csv")
#write_csv(ndata, 'college.csv')

