# User Backend API for Pencom User

User API for Pencom withholding application. Module for Pencom user, for setup and configurations

## Setup

- Make a copy of `.env.sample` and save it as `.env` and replace the values with the actual values.

- Create a folder named `public` in the `src` folder for static files

## Directory

- `/public` is where the public access lies
  The `schedule_sample` holds the sample for the schedule uploads
  The `uploads` holds the contents of the uploads for the schedules
  The `logos` holds the contents of the logos or images of the account users

## Code fixes

- In the `node_modules/mongoose-seed/index.js` file comment out these to allow, `mongoose-seed` work

```
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
```
