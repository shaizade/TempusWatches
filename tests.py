# TASK 1
while True:
    password = input("Введите пароль: ")

    if len(password) < 8:
        print("Пароль слишком простой")
    elif not any(char.isupper() for char in password):
        print("Нужен хотя бы один регистр")
    elif not any(char.isdigit() for char in password):
        print("Нужна хотя бы одна цифра")
    elif not all(char.isalnum() and char.isascii() for char in password):
        print("Только английские буквы и цифры")
    else:
        print("Пароль надежный")
    break

#TASK 2
# while True:
#     try:
#         x = float(input("Введите координату X: "))
#         y = float(input("Введите координату Y: "))
#     except ValueError:
#         print("Введите число!")
#         continue
#
#     if x == 0 or y == 0:
#         print("На оси")
#     elif x > 0 and y > 0:
#         print("I четверть")
#     elif x < 0 and y > 0:
#         print("II четверть")
#     elif x < 0 and y < 0:
#         print("III четверть")
#     elif x > 0 and y < 0:
#         print("IV четверть")
#
#     again = input("Хотите проверить ещё одну точку? (y/n): ").lower()
#     if again != "y":
# break
