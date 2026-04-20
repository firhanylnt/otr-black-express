# Task List

## High Priority

### [  ] #2 - Homepage - a.hero__main banner
**Steps to Reproduce:**
1. Open homepage
2. Click on the main hero banner

**Expected:** Banner navigates to a specific detail page  
**Actual:** No navigation occurs — detail page destination is undefined  
**Notes:** Needs routing target from PO

---

### [  ] #3 - Homepage - a.hero_card
**Steps to Reproduce:**
1. Open homepage
2. Click on hero card (1st & 2nd card)

**Expected:** Card navigates to a specific detail page  
**Actual:** No navigation occurs — detail page destination is undefined  
**Notes:** Same issue as No. 2 — confirm if same root cause

---

### [X] #4 - Homepage - Residents Section ⏱️ 15 min
**Steps to Reproduce:**
1. Open homepage
2. Scroll on residents section
3. Click on any of the residents photo

**Expected:** Profile summary of the clicked resident appears  
**Actual:** Profile summary of the adjacent resident appears instead (wrong index displayed)  
**Notes:** Likely an off-by-one error in index mapping between photo array and profile data. Check how the click handler references the active index

---

### [  ] #10 - Archive - Picks - Song photo - Detail page
**Steps to Reproduce:**
1. Open archive page
2. Click "Picks" tab
3. Click on any song photo (e.g. Best Song by Unkown)

**Expected:** Opens the song's individual detail page  
**Actual:** Detail page shows a list of songs while the label says it is a Single  
**Notes:** Same issue as No. 5 — confirm if same root cause

---

### [X] #15 - Archive - Guests - Artist photo - Detail page
**Steps to Reproduce:**
1. Open archive page
2. Click "Guests" tab
3. Click on any photo (e.g. Lowkey Collective)

**Expected:** Open the artist's detail page  
**Actual:** Detail page shows "Dj Alleycat"  
**Notes:** This happens on any of the guests' detail page

---

### [  ] #16 - Archive - Featured - Main banner - Detail page
**Steps to Reproduce:**
1. Open archive page
2. Click "Featured" tab
3. Click on the main banner

**Expected:** Open the content's detail page  
**Actual:** Page not found  
**Notes:** The interface for this page has not been developed.

---

### [  ] #17 - Archive - Featured - Poster photo - Detail page
**Steps to Reproduce:**
1. Open archive page
2. Click "Featured" tab
3. Click on any photo (e.g. Lowkey Collective)

**Expected:** Open the content's detail page  
**Actual:** Page not found  
**Notes:** The interface for this page has not been developed.

---

### [X] #23 - Discover - Full Catalog
**Steps to Reproduce:**
1. Open discover page
2. Scroll on Full Catalog
3. Click on "View Details" button on any content card (e.g. Best Song by Unknown)

**Expected:** Card navigates to a specific detail page  
**Actual:** Card navigate to the wrong detail page

---

### [X] #25 - Program - Content Detail Page - Music Player
**Steps to Reproduce:**
1. Open program page
2. Click on any content card (e.g. Indie Alley Radio)
3. Play any content (e.g #45)

**Expected:** Floating music player appears at the bottom of the page and starts playing  
**Actual:** No music player appears and music does not play  
**Notes:** Check if the floating player component is being triggered on content card click. Likely the click event is not passing the content data to the player, or the player component is not mounted on this page.

---

## Medium Priority

### [  ] #7 - Archive - All - Song photo - Detail page
**Steps to Reproduce:**
1. Open archive page
2. Click "All" tab (should be the default archive page)
3. Click on any song photo (e.g. Best Song by Unkown)

**Expected:** Opens the song's individual detail page  
**Actual:** Detail page shows a list of songs while the label says it is a Single  
**Notes:** Possible label misdetection by auto-detect logic, Single is being routed as Album/Mixtape. Check if label value is correctly passed to the click handler. Cross-check with label auto-detect logic

---

### [  ] #9 - Archive - Picks - Filter cards ⏱️ 30 min (with #12, #14)
**Steps to Reproduce:**
1. Open archive page
2. Click "Picks" tab
3. Click on any filter below the tab description (e.g. "Mixtape")

**Expected:** Only shows contents with the clicked label  
**Actual:** No changes happen after clicking any of the filter card

---

### [  ] #12 - Archive - Residents - Filter cards ⏱️ 30 min (with #9, #14)
**Steps to Reproduce:**
1. Open archive page
2. Click "Residents" tab
3. Click on any filter below the tab description (e.g. "Hip Hop")

**Expected:** Only shows contents with the clicked label  
**Actual:** No changes happen after clicking any of the filter card

---

### [  ] #14 - Archive - Guests - Filter cards ⏱️ 30 min (with #9, #12)
**Steps to Reproduce:**
1. Open archive page
2. Click "Guests" tab
3. Click on any filter below the tab description (e.g. "Hip Hop")

**Expected:** Only shows contents with the clicked label  
**Actual:** No changes happen after clicking any of the filter card

---

### [X] #28 - Program - Content detail page - More Program section
**Steps to Reproduce:**
1. Open program page
2. Click on any content card (e.g. warehouse session)
3. Scroll on More Programs
4. Hovers on any content cards

**Expected:** Program title, episode amount, and a short description should appear on hover.  
**Actual:** Nothing appears on hover

---

## Low Priority

### [X] #1 - Homepage - a.hero_card
**Steps to Reproduce:**
1. Open homepage on first visit or hard refresh
2. Observe initial render

**Expected:** Hero card appears immediately on load  
**Actual:** Hero card appears with a noticeable delay (estimated ~1-2s)  
**Notes:** Check animation/lazy load trigger

---

### [X] #5 - Archive - All
**Steps to Reproduce:**
1. Open Archive page
2. All page should be the default page

**Expected:** Content cards appears immediately on load  
**Actual:** Contents card appears with a noticeable delay (estimated ~1-2s)  
**Notes:** Check animation/lazy load trigger

---

### [  ] #6 - Archive - All - Filter cards ⏱️ 20 min
**Steps to Reproduce:**
1. Open Archive page
2. All page should be the default page

**Expected:** There should be a filter card section below the Tab description  
**Actual:** There is no filter cards displayed on the All page  
**Notes:** Filter cards section is not rendering on the All tab. Check if the filter card component is conditionally hidden on the All view, or if it's only mounted for specific tabs (Picks, Residents, etc.). May be a missing render condition or the component isn't being called on the All page

---

### [X] #8 - Archive - Picks
**Steps to Reproduce:**
1. Open Picks page

**Expected:** Content cards appears immediately on load  
**Actual:** Contents card appears with a noticeable delay (estimated ~1-2s)  
**Notes:** Check animation/lazy load trigger

---

### [X] #11 - Archive - Residents
**Steps to Reproduce:**
1. Open archive page
2. Click "Residents" tab

**Expected:** Content cards appears immediately on load  
**Actual:** Contents card appears with a noticeable delay (estimated ~1-2s)  
**Notes:** Check animation/lazy load trigger

---

### [X] #13 - Archive - Guests
**Steps to Reproduce:**
1. Open archive page
2. Click "Guests" tab

**Expected:** Content cards appears immediately on load  
**Actual:** Contents card appears with a noticeable delay (estimated ~1-2s)  
**Notes:** Check animation/lazy load trigger

---

### [X] #18 - Discover - Browse by Genre
**Steps to Reproduce:**
1. Open discover page
2. Browse by Genre should be at the top section of the page

**Expected:** Contents appears immediately on load  
**Actual:** Contents appear with a noticeable delay (estimated ~1-2s)  
**Notes:** Check animation/lazy load trigger

---

### [  ] #19 - Discover - Browse by Genre ⏱️ 20 min (with #21, #22)
**Steps to Reproduce:**
1. Open discover page
2. Browse by Genre should be at the top section of the page

**Expected:** Filter cards follow a consistent black - white - black alternating color pattern  
**Actual:** Color alternation pattern breaks on certain screen sizes  
**Notes:** Color alternation should always follow black - white - black regardless of how many columns are displayed per row. Check if the color logic is index-based (0, 1, 2 = black, white, black). if so it should hold across all breakpoints without needing to recalculate per row.

---

### [X] #20 - Discover - Mood & Vibes
**Steps to Reproduce:**
1. Open discover page
2. Scroll on Mood & Vibes section

**Expected:** Contents appears immediately on load  
**Actual:** Contents appear with a noticeable delay (estimated ~1-2s)  
**Notes:** Check animation/lazy load trigger

---

### [  ] #21 - Discover - Mood & Vibes ⏱️ 20 min (with #19, #22)
**Steps to Reproduce:**
1. Open discover page
2. Scroll on Mood & Vibes section

**Expected:** Filter cards follow a consistent black - white - black alternating color pattern  
**Actual:** Color alternation pattern breaks on certain screen sizes  
**Notes:** Color alternation should always follow black - white - black regardless of how many columns are displayed per row. Check if the color logic is index-based (0, 1, 2 = black, white, black). if so it should hold across all breakpoints without needing to recalculate per row.

---

### [  ] #22 - Discover - Browse by Genre & Mood & Vibes - Content Cards ⏱️ 20 min (with #19, #21)
**Steps to Reproduce:**
1. Open Discover page
2. Check filter cards on Browse by Genre and Mood & Vibes sections across desktop, responsive, and mobile views

**Expected:** Filter cards in Browse by Genre and Mood & Vibes have identical widths on the same screen size  
**Actual:** Card widths differ between the two sections, Browse by Genre cards appear wider/narrower than Mood & Vibes cards  
**Notes:** Both sections likely have separate width rules. Align them to use the same width value or the same shared class so they stay consistent across all breakpoints automatically.

---

### [X] #24 - Program
**Steps to Reproduce:**
1. Open program page

**Expected:** Contents appears immediately on load  
**Actual:** Contents appear with a noticeable delay (estimated ~1-2s)  
**Notes:** Check animation/lazy load trigger

---

### [X] #26 - Program - Content Detail Page - Embedded Youtube Link Content
**Steps to Reproduce:**
1. Open program page
2. Click on any content card (e.g. warehouse session)
3. Check for youtube play button below the content card

**Expected:** YouTube play button appears below the content card  
**Actual:** YouTube play button font/icon is not showing below the content card (only shows when on hovers)  
**Notes:** Check if the YouTube icon font or asset is loading correctly. May be a missing import or broken asset reference.

---

### [  ] #27 - Program - Content Detail Page - Embedded Youtube Link Content
**Steps to Reproduce:**
1. Open program page
2. Click on any content card (e.g. warehouse session)
3. Check inside the content card

**Expected:** No play button displayed inside the content card  
**Actual:** A play button is showing inside the content card when it shouldn't be

---

## Symbol Legend

- `[X]` = Done
- `[  ]` = Todo
- `[.]` = Obstacle
- `[O]` = On Progress
- `[R]` = Review
