import {test,expect} from '@playwright/test';
test('lessons persist and learning data can be cleared',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Find your starting point'}).click();
 await page.getByRole('button',{name:/Manipulation awareness When influence/}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Mark as complete'}).click();
 await expect(page.getByRole('button',{name:'Lesson completed'})).toBeDisabled();
 await page.keyboard.press('Escape');
 await page.reload();
 await page.getByRole('button',{name:'My progress',exact:true}).click();
 await expect(page.getByText('1/6',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Clear all learning data'}).click();
 await page.getByRole('button',{name:'Yes, clear progress'}).click();
 await expect(page.getByText('0/6',{exact:true}).first()).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('shadowmind-progress'))).toBeNull();
});
test('quiz scores real answers and saves best result',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Practice studio',exact:true}).click();
 await page.getByRole('tab',{name:'Knowledge check'}).click();
 for(const [i,answer] of ['One disagreement is not enough','If insults continue','Pause and check','Confirmation bias','Name the feeling'].entries()){
  await page.getByRole('button',{name:new RegExp(answer)}).click();
  await page.getByRole('button',{name:i===4?'See my results':'Next question'}).click();
 }
 await expect(page.getByRole('heading',{name:'You got 5 of 5 correct.'})).toBeVisible();
 await page.getByRole('button',{name:'My progress',exact:true}).click();
 await expect(page.getByText('5/5',{exact:true})).toBeVisible();
});
test('cases, flashcards and conversation provide feedback',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Practice studio',exact:true}).click();
 await page.getByRole('button',{name:/Acknowledge their disappointment/}).click();
 await expect(page.getByRole('status')).toContainText('A thoughtful direction');
 await page.getByRole('button',{name:'Next case'}).click();
 await expect(page.getByRole('heading',{name:'The meeting you remember differently'})).toBeVisible();
 await page.getByRole('tab',{name:'Flashcards'}).click();
 await page.getByRole('button',{name:'Reveal definition'}).click();
 await expect(page.getByRole('heading',{name:/A pattern of undermining confidence/})).toBeVisible();
 await page.getByRole('button',{name:'Got it'}).click();
 await expect(page.getByText('1 of 6 marked familiar.',{exact:false})).toBeVisible();
 await page.getByRole('tab',{name:'Conversations'}).click();
 await page.getByRole('button',{name:/I hear you are under pressure/}).click();
 await expect(page.getByRole('status')).toContainText('Clear and considerate');
});
test('private mode prevents new storage and malformed storage recovers',async({page})=>{
 await page.goto('/');await page.evaluate(()=>localStorage.setItem('shadowmind-progress','broken'));await page.reload();
 await page.getByRole('button',{name:'My progress',exact:true}).click();
 await page.getByLabel('Private session').check();
 await page.getByRole('button',{name:'Continue exploring'}).click();
 await page.getByRole('button',{name:'Mark as complete'}).click();await page.keyboard.press('Escape');
 await expect(page.getByText('1/6',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('shadowmind-progress'))).toBe('broken');
});
test('mobile layout, navigation and keyboard dialog',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByRole('heading',{name:/Understand people/})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.screenshot({path:'test-results/mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Open menu'}).click();
 await page.getByRole('button',{name:'Learning paths',exact:true}).click();
 await page.getByRole('button',{name:/Gaslighting Finding your footing/}).click();
 await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('desktop renders without runtime errors or overflow',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1440,height:1100});await page.goto('/');
 await page.screenshot({path:'test-results/desktop.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 await page.getByRole('button',{name:'The reading room'}).click();
 await expect(page.getByRole('heading',{name:'Sources & further reading'})).toBeVisible();
 await expect(page.locator('.sources a')).toHaveCount(6);expect(errors).toEqual([]);
});
test('core pages have no serious accessibility violations',async({page})=>{
 const {default:AxeBuilder}=await import('@axe-core/playwright');
 await page.goto('/');
 for(const name of ['Discover','Learning paths','Practice studio','My progress']){
  await page.getByRole('button',{name,exact:true}).click();
  const results=await new AxeBuilder({page}).analyze();
  expect(results.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 }
});
