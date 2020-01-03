#!/usr/bin/python
# -*- coding: latin-1 -*-
from robot.libraries.BuiltIn import BuiltIn, register_run_keyword
from robot.api.deco import keyword
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import time
import re
import os
import sys
import locators
import inflection

# --------------------------------------------------------------------------------
# ⬇ ShotgunSite Class ⬇
# --------------------------------------------------------------------------------
class ShotgunSite(object):
    """Base class for all Shotgun sites"""
    def __init__(self, driver=None, baseUrl='', browser=''):
        robot_log('Initializing...')
        self.permitted_browsers = ['chrome', 'firefox', 'safari']
        self._driver = driver
        self._baseUrl = baseUrl
        self.baseUrl = baseUrl
        self._current_user = {}
        self._browser = browser
        self.browser = browser

        # Set up default waits
        self.IMPLICIT_WAIT = os.environ.get("IMPLICIT_WAIT", 1)
        self.PAGE_LOAD_TIMEOUT = os.environ.get("PAGE_LOAD_TIMEOUT", 30)

        # Set the webdriver
        self.driver = driver

    @property
    def driver(self):
        return self._driver

    @driver.setter
    def driver(self, d):
        robot_log('Setting self.driver to... %s' % d)
        if d == None:
            self.launch_browser()
        else:
            self._driver = d

    @property
    def baseUrl(self):
        return self._baseUrl

    @baseUrl.setter
    def baseUrl(self, b):
        # TODO: Improve this url validation
        pattern = '^http[s]?://.*[(shotgunstudio|shotguncloud)]{1}\.com[/]?$'
        if not re.findall(pattern, b):
            raise Exception("baseUrl must begin with http(s) and end with either shotgunstudio.com or shotguncloud.com")
        else:
            c = self.prettify_baseUrl(b)
            robot_log('baseUrl as "b"= %s\nPrettified baseUrl c=%s' % (b, c))
            self._baseUrl = b

    @property
    def browser(self):
        return self._browser

    @browser.setter
    def browser(self, b):
        robot_log('Setting self.browser')
        if not b.lower() in self.permitted_browsers:
            raise Exception("browser must be one of %s" % self._permitted_browsers)
        self._browser = b.lower()

    # ..................................................
    # ⬇ Browser Open/Close Methods ⬇
    # ..................................................
    def launch_browser(self):
        robot_log('I am launching a browser')
        # Launch the correct browser...
        eval("self.launch_%s()" % self.browser)
        # Apply browser defaults
        self.set_browser_defaults()
        # Navigate to base Url
        self.get(self.baseUrl)

    def launch_safari(self):
        self.driver = webdriver.Safari()
        return True

    def launch_chrome(self):
        self.driver = webdriver.Chrome()
        return True
        chrome_options = webdriver.ChromeOptions()
        # chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        # return webdriver.Chrome(os.environ['PATH_TO_CHROME'], chrome_options=chrome_options)

    def launch_firefox(self):
        self.driver = webdriver.Firefox()
        return True

    def set_browser_defaults(self):
        # Maximize window
        self.driver.maximize_window()
        # Implicit wait
        self.driver.implicitly_wait(self.IMPLICIT_WAIT)
        # Page Load timeout
        self.driver.set_page_load_timeout(self.PAGE_LOAD_TIMEOUT)

    def quit(self):
        self.driver.quit()

    def get_driver(self):
        return self.driver

    def get(self, url):
        prettified_url = self.prettify_url(url)
        robot_log('Original url: %s\nPrettified url: %s' % (url, prettified_url))
        if isinstance(prettified_url, str):
            self.driver.get(prettified_url)
        else:
            robot_log('Passed in URL is not a string. Ignoring...')
    # ..................................................
    # ⬇ Helpers ⬇
    # ..................................................
    def prettify_baseUrl(self, url):
        """Remove the trailing / from baseUrl"""
        if url.endswith('/'):
            new_url = re.sub(r"/$", "", url)
            return new_url
        else:
            return url

    def prettify_url(self, url):
        """Takes what might be a relative url and fixes it into an absolute url"""
        if url in [None, '']:
            robot_log('Prettifying a url that is either None or empty string...')
            return None
        elif url.startswith('/'):
            # eg: /page/882
            robot_log('Prettifying url that starts with /...')
            return "%s%s" %(self.baseUrl, url)
        elif not url.startswith('http'):
            # Assume a pattern like page/ api/
            return "%s/%s" %(self.baseUrl, url)
        else:
            # Perhaps it is just another absolute url
            return url

    # ..................................................
    # ⬇ Login/Logout ⬇
    # ..................................................
    def login(self, username='', password='', wait_until_logged_in=True):
        # First, go to the login form
        self.get("/user/login")
        # Clear and Enter username
        self.driver.find_element( *locators.LoginFormLocators.USERNAME_INPUT ).clear()
        self.driver.find_element( *locators.LoginFormLocators.USERNAME_INPUT ).send_keys(username)
        # Clear and Enter password
        self.driver.find_element( *locators.LoginFormLocators.PASSWORD_INPUT ).clear()
        self.driver.find_element( *locators.LoginFormLocators.PASSWORD_INPUT ).send_keys(password)
        # Click submit
        self.driver.find_element( *locators.LoginFormLocators.LOGIN_BTN ).click()
        # Assert you are logged in
        if wait_until_logged_in == True:
            robot_log('Confirming I am logged in...')
            self.wait_until_logged_in()

    def logout(self):
        self.get('/user/logout')
        self.driver.delete_all_cookies()

    # ..................................................
    # ⬇ Execute Javascript ⬇
    # ..................................................
    def execute_script(self, js):
        robot_log("Executing this js: %s" %js)
        return self.driver.execute_script(js)

    # ..................................................
    # ⬇ Wait for Condition (eval'ed js) ⬇
    # ..................................................
    def wait_for_condition(self, *args, **kwargs):
        if 'condition' in kwargs:
            condition = kwargs['condition']
        elif len(args) > 0:
            condition = args[0]
        else:
            return False
        # Create the anonymous throwaway function...
        def func(*args):
            return_value = self.execute_script(condition)
            return return_value == True
        # Now, wait for the function to return a Truthy value
        WebDriverWait(self.driver, timeout=self.PAGE_LOAD_TIMEOUT).until(func)

    # ..................................................
    # ⬇ Wait until Logged in ⬇
    # ..................................................
    def wait_until_logged_in(self):
        robot_log('I am in the wait until func')
        # Find out if you're really logged in...
        self.wait_for_condition(condition="try {return SG.globals.current_user.id > 0;}catch (err) {return false;}")
        robot_log('You are logged in!!!')
        # Set your current_user
        self.current_user = self.execute_script("return SG.globals.current_user")


# --------------------------------------------------------------------------------
# ⬇ Page Class ⬇
# --------------------------------------------------------------------------------
class Page(ShotgunSite):
    """To instantiate... p = SG.Page(ShotgunSiteInstance.driver)"""
    def __init__(self, ShotgunSiteInstance, project_id=None):
        self.project_id = project_id
        super(Page, self).__init__(ShotgunSiteInstance.driver, ShotgunSiteInstance.baseUrl, ShotgunSiteInstance.browser)

    def reload(self):
        self.driver.refresh()

    def navigate_to_project_page(self, entity_type=''):
        """Navigates to a project entity query page"""
        # clean up the entity_type
        entity_type = inflection.singularize(inflection.camelize(entity_type))
        # Form the url...
        url = '%s/page/project_default?entity_type=%s&project_id=%s' %(self.baseUrl, entity_type, self.project_id)
        # Get the url...
        self.get(url)
        # Ensure the page is loaded...
        self.wait_for_page_to_load()

    def wait_for_page_to_load(self):
        """Waits for the page to load"""
        self.wait_for_condition(condition="return document.readyState === 'complete'")
        self.wait_for_spinner()

    def wait_for_spinner(self):
        # Wait for the spinner to either NOT Exist or to be invisible
        WebDriverWait(self.driver, self.IMPLICIT_WAIT).until(
            EC.invisibility_of_element_located( locators.MainPageLocators.SPINNER )
        )

    def navigate_to_page(self, page_id):
        """Navigates to a page by id"""
        self.get(page_id)

    def get_page_mode(self):
        mode = self.execute_script("return SG.globals.page.root_widget.get_child_widgets()[2].get_mode()")
        return mode

    def set_page_mode(self, mode):
        self.toggle_page_mode(mode)

    def toggle_page_mode(self, mode):
        # Only click an element if the existing page mode != mode
        if self.get_page_mode() != mode:
            # Build a locator string from the passed in mode
            locator_string = "locators.MainPageLocators.PAGEMODE_BUTTON_%s" % mode.upper()
            # Create a locator object
            locator = eval(locator_string)
            # Click the locator
            self.driver.find_element( *locator ).click()

    def run_quick_filter(self, search_string=""):
        # Click into the quick filter
        l = locators.MainPageLocators.QUICK_FILTER_TEXT_INPUT
        self.driver.find_element( *l ).click()
        # Type a query
        self.driver.find_element( *l ).send_keys(search_string)
        # Hit return
        self.driver.find_element( *l ).send_keys(Keys.RETURN)
        # Wait for the spinner
        self.wait_for_spinner()

    def should_contain_text(self, text):
        """Tests whether or not document.body's inner Text contains `text`"""
        self.wait_for_condition('return document.body.innerText.includes("%s")' % text)





# --------------------------------------------------------------------------------
# ⬇ Python to Robot Keyword methods ⬇
# --------------------------------------------------------------------------------
def robot_log(msg):
    # return BuiltIn().run_keyword('Log To Console', msg)
    # print(msg)
    return True
