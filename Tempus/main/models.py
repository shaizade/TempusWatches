from django.db import models

class Student(models.Model):
    first_name = models.CharField(max_length=100)   # имя
    last_name = models.CharField(max_length=100)    # фамилия
    age = models.IntegerField()                     # возраст
    group = models.CharField(max_length=20)         # группа

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
