// Importing the better-sqlite3 library to interact with SQLite
import sql from 'better-sqlite3';

// Connecting to (or creating) a SQLite database file named 'posts.db'
const db = new sql('posts.db');

// Function to initialize the database with required tables and seed data
function initDb() {
  // Create the 'users' table if it doesn't already exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY, 
      first_name TEXT, 
      last_name TEXT,
      email TEXT
    )`);

  // Create the 'posts' table with a foreign key reference to 'users'
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY, 
      image_url TEXT NOT NULL,
      title TEXT NOT NULL, 
      content TEXT NOT NULL, 
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      user_id INTEGER, 
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

  // Create the 'likes' table to track which users liked which posts
  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER, 
      post_id INTEGER, 
      PRIMARY KEY(user_id, post_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, 
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
    )`);

  // Check if any users already exist in the database
  const stmt = db.prepare('SELECT COUNT(*) AS count FROM users');

  // If no users exist, insert two sample users for testing
  if (stmt.get().count === 0) {
    db.exec(`
      INSERT INTO users (first_name, last_name, email)
      VALUES ('John', 'Doe', 'john@example.com')
    `);

    db.exec(`
      INSERT INTO users (first_name, last_name, email)
      VALUES ('Max', 'Schwarz', 'max@example.com')
    `);
  }
}

// Initialize the database when this file is loaded
initDb();

// Function to fetch posts, including user info, like count, and whether user 2 liked it
export async function getPosts(maxNumber) {
  let limitClause = '';

  // If a max number is specified, add a LIMIT to the SQL
  if (maxNumber) {
    limitClause = 'LIMIT ?';
  }

  // Prepare a SQL query that returns post data with user names, number of likes,
  // and a boolean indicating if user ID 2 has liked the post
  const stmt = db.prepare(`
    SELECT 
      posts.id, 
      image_url AS image, 
      title, 
      content, 
      created_at AS createdAt, 
      first_name AS userFirstName, 
      last_name AS userLastName, 
      COUNT(likes.post_id) AS likes, 
      EXISTS (
        SELECT * FROM likes 
        WHERE likes.post_id = posts.id AND likes.user_id = 2
      ) AS isLiked
    FROM posts
    INNER JOIN users ON posts.user_id = users.id
    LEFT JOIN likes ON posts.id = likes.post_id
    GROUP BY posts.id
    ORDER BY createdAt DESC
    ${limitClause}
  `);

  // Simulate a 1-second delay (e.g. to imitate async DB/network behavior)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Execute and return the results
  return maxNumber ? stmt.all(maxNumber) : stmt.all();
}

// Function to insert a new post into the database
export async function storePost(post) {
  const stmt = db.prepare(`
    INSERT INTO posts (image_url, title, content, user_id)
    VALUES (?, ?, ?, ?)
  `);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return stmt.run(post.imageUrl, post.title, post.content, post.userId);
}

export async function updatePostLikeStatus(postId, userId) {
  // 1. Prepare a query to check how many records exist in the "likes" table
  //    for the given user and post.
  const stmt = db.prepare(`
    SELECT COUNT(*) AS count
    FROM likes
    WHERE user_id = ? AND post_id = ?
  `);

  // 2. Execute the query with userId and postId to see if a like already exists.
  //    stmt.get(...) returns an object with a "count" property representing the number of records found.
  //    If count === 0, the user has not liked the post yet; otherwise, they have.
  const isLiked = stmt.get(userId, postId).count === 0;

  if (isLiked) {
    // 3. If the user has NOT liked the post yet (count === 0), prepare an INSERT statement
    //    to add a new like record.
    const stmt = db.prepare(`
      INSERT INTO likes (user_id, post_id)
      VALUES (?, ?)
    `);

    // 4. Wait 1 second to simulate delay (for demonstration purposes, not necessary in production).
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 5. Run the INSERT query with userId and postId to add the like (user likes the post).
    return stmt.run(userId, postId);
  } else {
    // 6. If the user HAS already liked the post (count !== 0), prepare a DELETE statement
    //    to remove the like (unlike).
    const stmt = db.prepare(`
      DELETE FROM likes
      WHERE user_id = ? AND post_id = ?
    `);

    // 7. Again, wait 1 second in this demo to simulate delay.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 8. Run the DELETE query with userId and postId to remove the like (user unlikes the post).
    return stmt.run(userId, postId);
  }
}
