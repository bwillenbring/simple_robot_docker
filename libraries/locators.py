#!/usr/bin/python
# -*- coding: latin-1 -*-
from selenium.webdriver.common.by import By

# --------------------------------------------------------------------------------
# ⬇ Login Form Locators ⬇
# --------------------------------------------------------------------------------
class LoginFormLocators(object):
    LOGO = (By.CSS_SELECTOR, 'img[src^="/images/logos/shotgun-classic-logo-rgb-black-28.svg"]')
    USERNAME_INPUT = (By.ID, 'user_login')
    PASSWORD_INPUT = (By.ID, 'user_password')
    LOGIN_BTN = (By.CSS_SELECTOR, 'form:nth-of-type(1) button[type="submit"]')

# --------------------------------------------------------------------------------
# ⬇ Page Locators ⬇
# --------------------------------------------------------------------------------
class MainPageLocators(object):
    # Shotgun global header
    HEADER = (By.ID, 'sg_global_nav')
