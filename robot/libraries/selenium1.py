import unittest
import SG
import os
import time
from shotgun_api3 import Shotgun

class ShotgunSiteTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Set some class properties so you can pass these off to all your test cases
        cls.baseUrl = os.environ.get("BASE_URL", "")
        cls.browser = os.environ.get("BROWSER", "chrome")
        cls.username = os.environ.get("USERNAME", "")
        cls.password = os.environ.get("PASSWORD", "")
        cls.project_id = os.environ.get("TEST_PROJECT_ID", 66)
        # Create a Shotgun API connection object
        cls.sg = Shotgun(cls.baseUrl, login=cls.username, password=cls.password)
        # Create a web driver
        cls.site = SG.ShotgunSite(baseUrl=cls.baseUrl, browser=cls.browser)


    def setUp(self):
        # Login to the test site
        self.site.login(username=self.username, password=self.password, wait_until_logged_in=True)


    def test_current_user_is_set(self):
        # Assert your current user id is good
        self.assertTrue(self.site.current_user.get("id") > 0, "Current user id is %s" % self.site.current_user.get("id"))


    def test_go_to_assets_page_and_run_quick_filter(self):
        # Create an asset, using the Shotgun API
        data = {
            "code": "Robot Test Asset",
            "project": {"type": "Project", "id": 66}
        }
        asset_id = self.sg.create("Asset", data)
        # Create a new page instance
        page = SG.Page(self.site, project_id=self.project_id)
        page.navigate_to_project_page(entity_type='Asset')
        time.sleep(2)
        page.toggle_page_mode('thumb')
        page.run_quick_filter(search_string="Robot Test Asset")
        # Save a screenshot
        self.site.driver.save_screenshot('assets_page_thumb_after_quick_filter.png')


    def tearDown(self):
        # Logout and clear your session
        self.site.logout()


    @classmethod
    def tearDownClass(cls):
        # Destroy all browsers
        cls.site.quit()


if __name__ == "__main__":
    unittest.main()
