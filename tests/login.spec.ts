import { test, expect } from '@playwright/test';

test("login validado com sucesso", async ({page}) => {
  await page.goto("https://www.saucedemo.com/")
});