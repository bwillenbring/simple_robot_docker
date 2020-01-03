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

    # Spinners
    SPINNER = (By.CSS_SELECTOR, '[data_cy="overlay-spinner"]')

    # TOOLBAR => Page Mode Buttons
    PAGEMODE_BUTTON_BROWSER = (By.CSS_SELECTOR, '[sg_selector="button:mode_browser"]')
    PAGEMODE_BUTTON_LIST = (By.CSS_SELECTOR, '[sg_selector="button:mode_list"]')
    PAGEMODE_BUTTON_THUMB = (By.CSS_SELECTOR, '[sg_selector="button:mode_thumb"]')
    PAGEMODE_BUTTON_CARD = (By.CSS_SELECTOR, '[sg_selector="button:mode_card"]')
    PAGEMODE_BUTTON_CALENDAR = (By.CSS_SELECTOR, '[sg_selector="button:mode_calendar"]')

    # TOOLBAR => Quickfilter
    QUICK_FILTER_JUMP_MENU = (By.CSS_SELECTOR, '.quick_filter .quick_jump_menu.icon_disclosure')
    QUICK_FILTER_TEXT_INPUT = (By.CSS_SELECTOR, '[sg_selector="input:quick_filter"]')
    QUICK_FILTER_CLEAR_BTN = (By.CSS_SELECTOR, '[sg_selector="button:clear_filter"]')
