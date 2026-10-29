import {test,expect} from '@playwright/test';
import {validateContent} from '../src/academy/inventory';
import {academyLessons} from '../src/academy/lessons';
import {academyQuestions} from '../src/academy/questions';
import {branchingCases} from '../src/academy/cases';
import {conversations} from '../src/academy/conversations';
import AxeBuilder from '@axe-core/playwright';
test('content inventory validates structure, counts and links',()=>{
 const result=validateContent();expect(result.errors).toEqual([]);
 expect(result.counts).toMatchObject({lessons:55,completeLessons:55,conversations:30,branchingCases:15,experiments:10,questions:100,flashcards:100,glossary:100,toolkit:30,brokenInternalLinks:0});
 for(const l of academyLessons){expect([l.definition,l.explanation,l.mechanism,...l.examples,...l.dialogue,l.notice,l.not,l.consequences,l.tips,l.alternative,...l.takeaways].join(' ').split(/\s+/).length).toBeGreaterThan(350);expect(l.check.options[l.check.correct]).toBeTruthy();}
 expect(new Set(conversations.map(c=>c.category)).size).toBe(10);
 expect(new Set(academyQuestions.map(q=>q.difficulty)).size).toBe(3);
});
async function academy(page:import('@playwright/test').Page){await page.goto('/');await page.getByRole('button',{name:'Academy',exact:true}).click();}
test('academy search, related lesson navigation, checks and persistence preserve original storage',async({page})=>{
 await page.goto('/');const original={completed:['gaslighting'],known:[2],cases:[1],best:3,attempts:1};await page.evaluate(p=>localStorage.setItem('shadowmind-progress',JSON.stringify(p)),original);await page.reload();await page.getByRole('button',{name:'Academy',exact:true}).click();
 await page.getByRole('searchbox',{name:'Search academy lessons'}).fill('gaslighting');
 await page.getByRole('button',{name:/MODULE B · LESSON 9 Gaslighting/}).click();
 await expect(page.getByRole('dialog')).toContainText('Noor repeatedly');
 await page.getByRole('button',{name:/This alone is insufficient/}).click();await expect(page.getByRole('dialog').getByRole('status')).toContainText('Well reasoned');
 await page.getByRole('button',{name:'Complete academy lesson'}).click();
 await page.getByRole('button',{name:'Manipulation: Meaning and Mechanisms',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('Interpersonal manipulation');await page.keyboard.press('Escape');
 await page.reload();await page.getByRole('button',{name:'Academy',exact:true}).click();await expect(page.getByText('1 / 55 academy lessons completed')).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('shadowmind-progress')!))).toEqual(original);
});
test('decoder gives uncertainty and bias lab changes outcomes',async({page})=>{
 await academy(page);await page.getByRole('button',{name:'Conversation decoder',exact:true}).click();
 await page.getByRole('button',{name:'A Insufficient information to determine whether manipulation occurred.'}).click();
 await expect(page.getByRole('status')).toContainText('Well reasoned');await expect(page.getByRole('heading',{name:'What remains uncertain'})).toBeVisible();
 await page.getByRole('button',{name:'Bias lab',exact:true}).click();await page.getByRole('button',{name:'The discount from 200',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('provides an anchor');
 await page.getByRole('button',{name:'Comparable jackets and a pre-set budget',exact:true}).click();await expect(page.getByRole('status')).toContainText('independent comparison');
});
test('all branching case paths terminate after at least three decisions',()=>{
 for(const c of branchingCases){const map=new Map(c.nodes.map(n=>[n.id,n]));function walk(id:string,depth:number){expect(depth).toBeLessThan(8);const node=map.get(id)!;expect(node).toBeTruthy();for(const choice of node.choices){if(choice.next)walk(choice.next,depth+1);else expect(depth).toBeGreaterThanOrEqual(3);}}walk('start',1);}
});
test('branch choices change the next scene and support restart',async({page})=>{
 await academy(page);await page.getByRole('button',{name:'Branching cases',exact:true}).click();
 await page.getByRole('button',{name:/Challenge Ellis publicly/}).click();await expect(page.getByText('The room is defensive. What can Imani do next?')).toBeVisible();
 await page.getByRole('button',{name:/Correct the overstatement/}).click();await page.getByRole('button',{name:/Complete and test the escalation process/}).click();
 await expect(page.getByRole('heading',{name:'Final reflection'})).toBeVisible();
 await page.getByRole('button',{name:'Explore another path'}).click();await page.getByRole('button',{name:/Ask volunteers for specific concerns/}).click();
 await expect(page.getByText('Ellis says, “The team already agreed.” How can Imani present the concern?')).toBeVisible();
});
test('arena calculates scores, reviews errors and stores a completed attempt once',async({page})=>{
 await academy(page);await page.getByRole('button',{name:'Quiz arena',exact:true}).click();await page.getByRole('button',{name:'Start academy quiz'}).click();
 for(let i=0;i<10;i++){const prompt=await page.locator('.question-prompt').innerText();const q=academyQuestions.find(q=>q.prompt===prompt)!;expect(q).toBeTruthy();await page.locator('.options button').nth(i===0?(q.correct+1)%q.options.length:q.correct).click();await page.getByRole('button',{name:i===9?'Review academy results':'Next academy question'}).click();}
 await expect(page.getByRole('heading',{name:'9 of 10 correct · 90%'})).toBeVisible();await expect(page.locator('.review')).toHaveCount(1);await page.getByLabel('Show only incorrect answers').uncheck();await expect(page.locator('.review')).toHaveCount(10);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('shadowmind-academy-v1')!));expect(saved.best).toBe(90);expect(saved.attempts).toBe(1);
});
test('revision bookmarks, learning, filtering and glossary links work',async({page})=>{
 await academy(page);await page.getByRole('button',{name:'Revision cards',exact:true}).click();
 await page.getByTitle('Reveal revision definition').click();await expect(page.getByRole('heading',{name:'The scientific study of mind and behaviour.'})).toBeVisible();
 await page.getByRole('button',{name:'Bookmark card',exact:true}).click();await page.getByRole('button',{name:'Mark learned',exact:true}).click();await page.getByLabel('Show cards').selectOption('Bookmarked');await expect(page.getByRole('button',{name:'Remove bookmark'})).toBeVisible();
 await page.getByRole('button',{name:'Next card'}).click();await page.getByRole('button',{name:'Previous card'}).click();
 await page.getByRole('button',{name:'Glossary',exact:true}).click();await page.getByRole('searchbox',{name:'Search glossary'}).fill('Gaslighting');await expect(page.locator('.glossary-list article')).toHaveCount(1);await page.getByRole('button',{name:'Related: Gaslighting'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
 await page.reload();await page.getByRole('button',{name:'Academy',exact:true}).click();await expect(page.getByText('1 familiar cards · 1 bookmarks')).toBeVisible();
});
test('private mode and clear all cover academy storage',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'My progress',exact:true}).click();await page.getByLabel('Private session').check();await page.getByRole('button',{name:'Academy',exact:true}).click();await page.getByRole('button',{name:'Revision cards',exact:true}).click();await page.getByRole('button',{name:'Mark learned'}).click();expect(await page.evaluate(()=>localStorage.getItem('shadowmind-academy-v1'))).toBeNull();
 await page.getByRole('button',{name:'My progress',exact:true}).click();await page.getByLabel('Private session').uncheck();await page.getByRole('button',{name:'Academy',exact:true}).click();await page.getByRole('button',{name:'Revision cards',exact:true}).click();await page.getByRole('button',{name:'Mark learned'}).click();expect(await page.evaluate(()=>localStorage.getItem('shadowmind-academy-v1'))).not.toBeNull();
 await page.getByRole('button',{name:'My progress',exact:true}).click();await page.getByRole('button',{name:'Clear all learning data'}).click();await page.getByRole('button',{name:'Yes, clear progress'}).click();expect(await page.evaluate(()=>localStorage.getItem('shadowmind-academy-v1'))).toBeNull();
});
test('academy mobile layout and key views are accessible',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Explore the academy',exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/academy-mobile.png',fullPage:true});
 for(const tab of ['Lessons','Conversation decoder','Branching cases','Bias lab','Quiz arena','Revision cards','Protection toolkit','Glossary','Content inventory']){
  await page.getByRole('button',{name:tab,exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),tab).toBe(true);
  await expect(page.locator('.academy-tabs button[aria-pressed=true]')).toHaveCSS('background-color','rgb(143, 75, 55)');
  const result=await new AxeBuilder({page}).analyze();expect(result.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),tab).toEqual([]);
 }
 await page.setViewportSize({width:1440,height:1000});await page.getByRole('button',{name:'Lessons',exact:true}).click();await expect(page.locator('.academy-tabs button[aria-pressed=true]')).toHaveCSS('background-color','rgb(143, 75, 55)');await page.screenshot({path:'test-results/academy-desktop.png',fullPage:true});
});
test('expanded modules are complete, ordered and preserve legacy IDs',()=>{
 expect(academyLessons.map(l=>l.number)).toEqual(Array.from({length:55},(_,i)=>i+1));
 for(const [module,count] of [['A',8],['B',16],['C',11],['D',10],['E',10]] as const)expect(academyLessons.filter(l=>l.module===module)).toHaveLength(count);
 for(const id of ['introduction','behaviour','manipulation-academy','influence','coercion','emotional-influence','power','boundaries-academy','gaslighting-academy','confirmation','dark-patterns','ethics'])expect(academyLessons.some(l=>l.id===id)).toBe(true);
 for(const id of ['team-launch','friend-loan','viral-cure'])expect(branchingCases.some(c=>c.id===id)).toBe(true);
 for(const l of academyLessons){expect(l.references.length).toBeGreaterThan(0);expect(l.related.length).toBeGreaterThan(0);expect(l.examples[0]).not.toBe(l.examples[1]);}
});
test('pre-expansion academy progress and bookmarks survive new lesson completion',async({page})=>{
 await page.goto('/');const old={completed:['introduction','gaslighting-academy','ethics'],learned:['revision-term-1'],bookmarks:['revision-term-2'],cases:['team-launch'],best:70,attempts:2};
 await page.evaluate(s=>localStorage.setItem('shadowmind-academy-v1',JSON.stringify(s)),old);await page.getByRole('button',{name:'Academy',exact:true}).click();
 await expect(page.getByText('3 / 55 academy lessons completed')).toBeVisible();
 await page.getByRole('searchbox',{name:'Search academy lessons'}).fill('Practical access');
 await page.getByRole('button',{name:/MODULE B · LESSON 21/}).click();
 await page.getByRole('button',{name:'Complete academy lesson',exact:true}).click();await page.keyboard.press('Escape');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('shadowmind-academy-v1')!));
 expect(saved).toEqual({...old,completed:[...old.completed,'isolation-control']});
 await page.getByRole('button',{name:'Revision cards',exact:true}).click();await page.getByLabel('Show cards').selectOption('Bookmarked');
 await expect(page.getByRole('heading',{name:'Behaviour',exact:true})).toBeVisible();
});
test('new modules, related links and a new three-decision case work on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Explore the academy',exact:true}).click();
 await page.getByLabel('Curriculum module').selectOption('C');await expect(page.getByRole('status')).toContainText('11 lessons found');
 await page.getByRole('button',{name:/MODULE C · LESSON 28/}).click();await expect(page.getByRole('dialog')).toContainText('countdown');
 await page.getByRole('button',{name:'Fear of Missing Out',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('FOMO');
 await page.screenshot({path:'test-results/expanded-lesson-mobile.png'});await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Branching cases',exact:true}).click();await page.getByLabel('Choose a branching case').selectOption('family-calendar');
 await page.getByRole('button',{name:/Explain the shift and offer two feasible visit times/}).click();
 await page.getByRole('button',{name:/Name the specific availability/}).click();
 await page.getByRole('button',{name:/Ask their father’s preferences/}).click();await expect(page.getByRole('heading',{name:'Final reflection'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Content inventory',exact:true}).click();await expect(page.getByText('All five curriculum modules, 15 branching cases, and 100 questions are implemented.',{exact:false})).toBeVisible();
 await page.screenshot({path:'test-results/expanded-inventory-mobile.png'});
});
