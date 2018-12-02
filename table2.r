tbl <- read.table(file.choose(),header=TRUE,sep=';')
values <- tbl[c("valor")]
mean <- round(mean(as.numeric(unlist(values))), digits = 1)
desviation <- round(sd(as.numeric(unlist(values))), digits = 2)
print(paste0(mean, " +- ", desviation))

