import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('static guest has accessible public copy and no authentication data',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 const audit=await new AxeBuilder({page}).analyze();
 expect(audit.violations).toEqual([]);
 const body=await page.locator('body').textContent();
 expect(body).not.toContain('PRIVATE_SENTINEL');
});
test('owner and guessed draft pages remain unavailable',async({page})=>{
 const r=await page.goto('/dashboard');expect(r?.status()).toBe(404);
 const draft=await page.goto('/random-owner');expect(draft?.status()).toBe(404);
});
