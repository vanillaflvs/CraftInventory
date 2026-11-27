# CraftInventory

CraftInventory is an academic web development project inspired by Minecraft, designed to recreate the player's inventory interface in a web browser. It aims to provide a familiar visual experience while allowing users to interact with an inventory system based on the original game's design.

## Install

Make sure you have **Node.js** and **npm** installed on your computer.

**1. Clone the repository:**

```bash
git clone <https://github.com/vanillaflvs/CraftInventory.git>
```

**2. Navigate to the project folder:**

```bash
cd CraftInventory
```

**3. Install the project dependencies:**

```bash
npm install
```

This command automatically installs all the dependencies listed in `package.json`, including:

- Express
- EJS
- MySQL2
- Nodemon
- Other required packages

**4. Start the application:**

```bash
npm start
```

**Note:** Make sure your MySQL database is properly configured before running the application. Nodemon is used to automatically restart the server when changes are detected during development.

## Database Setup & Running

* **Configure the Database:**
  Ensure your local MySQL server is running. Create the database and execute the provided SQL script (`script.sql` or `craftProj.sql`) to set up the tables:
  ```sql
  CREATE DATABASE CraftDb;
  ```
* **Configure Environment Variables:**
  Create a `.env` file in the root directory based on `.env.example` and configure your local MySQL credentials:
  ```env
  PORT=3000
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=1234
  DB_NAME=CraftDb
  ```
  > **Note:** Adjust `DB_PASSWORD` and `DB_NAME` if your local MySQL setup uses a password or a different database name.
* **Start the application:**
  ```bash
  npm start
  ```
  > Nodemon is used to automatically restart the server when changes are detected during development.
* **Access the Application:**
  Once the server is running and connected to the database, open your browser and navigate to:
  ```text
  http://localhost:3000
  ```

## Usage

CraftInventory allows users to manage their own item inventories through a web interface inspired by Minecraft. The application supports multiple user accounts, with each user having an individual inventory.

Users can:

- **Log in:** Access their personal account through the login page.
- **Add items:** Include new items in their inventory.
- **Remove items:** Delete items from their inventory.
- **Search items:** Find specific items using the search functionality in the item list.

Each account maintains its own inventory, allowing multiple users to manage their items independently within the same application.

## Authors

Jhonny Richard dos Santos, João Pedro Maffei Carraro, Leonardo Henrique Alves Pereira e Lief Kataoka

## Contributing

We are not currently accepting code contributions or Pull Requests (PRs).

## License

MIT © Richard McRichface
