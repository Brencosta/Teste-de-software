import { test, expect } from '@playwright/test';

test("login validado com sucesso", async ({page}) => {
  await page.goto("https://www.saucedemo.com/")
  await page.getByPlaceholder("Username").fill("standard_user")
  await page.getByPlaceholder("Password").fill("secret_sauce")
  await page.locator("#login-button").click()
  await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html")
  await page.waitForTimeout(1000)
});