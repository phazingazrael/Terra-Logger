```
For the code:
1. Please use eslint and prettier to format your code! This will help you in the long run!
2. Please use environment variables! You used PORT, but target everything to localhost, id add a HOST variable!
3. I highly suggest switching to typescript for the long run, this will help the longevity of the project.
4. the api / backend structure is a little barebones, I would highly suggest dockerizing this entire application so you can leverage using something like postgres and then have some migration tool like prisma to handle all this for you. You might be able to even get rid of the need of express. Or you can use Knex and still use REST and express, either or.

 -- Tangent stuff thats important but I wont bundle in here for code.
5. In react, since routing isn't handled for you directly, I suggest following a code structure as follows:

/routes
  /routeA
    - index.jsx
    - constants.js(x)
    - styles.js(x) (note, styled components rock!)
    /components
      - componentA.jsx
      - componentB.jsx
  /routeB
   ... ... ...
   This structure is what my mentors taught me a long time ago, and it marginally improved my ability to write code that was easier to understand and read.
More code shenanigans!

6. Anytime you see something repeating , try to map over it with a constant! e.g. categories,jsx, you write the same thing over and over, an array can solve that for you!
7. More reusable components! Break down stuff you think would be reusable elsewhere into their own components. I don't see much here, but just a thought!
8. This is only relevant in App.jsx for now, but a general rule of thumb I have for components is try to have them all be under 300 LOC, makes it much easier to read.
9. It looks like the backend doesnt have any package.json scripts to run concurrently with the frontend, I recommend adding that for ease!
chore: a really easy way to update your packages I HIGHLY recommend:  https://www.npmjs.com/package/npm-check-updates
10. if using vscode, highly recommend installing Conventional Commits by vivaxy, just gives you much better git messages!
11. Starting the code, theres an error! Prevent errors going into your main branch as much as you can! (Note, index.js in advRoutes has a typo for importing viewCity.jsx 😛 )
```
1. I have eslint and Prettier installed in vscode.
2. The env variable of port/localhost etc Is all 'demo' code from electron and is bare minimum to get it working, I know next to nothing on assigning/using env variables.
3. Planned, however due to limitations on when available to code, I have to finish what i started before i can start something new.
4. 
- 1. The api/backend is minimal by design. it's only use is to hold and provide data. with the intent of the app simply using something like localstorage isn't quite enough. Data needs to be accessible by both the 'front end' as well as the electron main environment to allow writing data to file in node.
- 2. Personally I'm against the idea of dockerizing this, it doesn't feel like a 'proper' use case for the intended use, also setting up docker generally is a pain for just some random user.
    - Using Azgaar's Fantasy Map generator to create a visual world map.
    - Taking that saved world map file '.map' and importing it to this program.
    - Show users an example of the data that will be included within each item from the '.map' file.
    - Use the data from the map to create text files for each city, country, etc. to then be used inside of Obsidian.md
5. This is the structure i'm attempting to 'emulate' however i do want to keep the 'simple' routes that don't need any additional data or configurations separated from the more advanced routes, like viewing a particular city (possibly editing a city. Not certain that feature will be added).
6. I am doing what i can to mitigate repetitive code, there are some places however i feel that it is actually easier to repeat code than to modularize it.
7. Noted, see above.
8. App.jsx is large I do agree. I'm focused more on getting it working and plan to clean it up when i feel its closer to a 'release'.
9. There really isn't a backend. Following a guide to get electron and express to work together, I don't recall exactly which, the guide indicated that using the main.js file from electron to run the express code. I'm aware this is likely counter-intuitive but it's working and i'm a hobbyist, i'll take it lol.
10. I do have some commit plugin installed, I'm familiar with the general git commit and push 'methods' but i haven't the slightest idea how to 'use' commits and also remembering to actually use them (i use github desktop most of the time for simplicity. remebering every git command is not something i seem able to do)
11. 
    - This load error when first opening is related to the database and reading the 'application.db' and It's something i'm aware of but still figuring out. if you reload with ctrl+r it works as intended.
    - the viewCity.jsx typo is and isn't a typo. initially i did call the file viewCity later decided to rename to ViewCity. everything matches as it should but the file rename doesn't apply in git and i'm not sure exactly how to force that to change, It's a windows 'feature(Bug)' where it accepts the same file name regardless of case. 


Notes:
Originally this started out as a personal script i wrote using just nodejs, [See Here](https://github.com/phazingazrael/Terra-Logger/tree/5a9521a2f39bc5b092e04793c9d0e226d8958282/src/afmg2folder), to create markdown files. I ended up having to revise it like 40 times to get it how i wanted the exported markdown files to be (that link). At that point I figured I might as well just go all in and turn it into something others could use.