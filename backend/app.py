from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import sqlite3
import os
from bs4 import BeautifulSoup
import requests
from urllib.parse import urlparse

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

# Configure CORS to allow requests from React dev server
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})

def init_db():
    try:
        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        
        # Create content_items table (existing)
        c.execute('''
            CREATE TABLE IF NOT EXISTS content_items
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
             title TEXT NOT NULL,
             description TEXT,
             status TEXT NOT NULL,
             date TEXT NOT NULL,
             color TEXT,
             campaign_id INTEGER)
        ''')
        
        # Create campaigns table
        c.execute('''
            CREATE TABLE IF NOT EXISTS campaigns
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
             title TEXT NOT NULL,
             description TEXT,
             status TEXT NOT NULL,
             startDate TEXT NOT NULL,
             endDate TEXT NOT NULL,
             color TEXT)
        ''')
        
        # Create social_posts table
        c.execute('''
            CREATE TABLE IF NOT EXISTS social_posts
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
             title TEXT NOT NULL,
             message TEXT NOT NULL,
             platforms TEXT NOT NULL,
             date TEXT NOT NULL)
        ''')
        
        conn.commit()
        conn.close()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        raise

# API Routes - Define these BEFORE the catch-all route
@app.route('/api/content-items', methods=['GET'])
def get_content_items():
    try:
        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        c.execute('SELECT * FROM content_items')
        items = c.fetchall()
        conn.close()
        
        return jsonify([{
            'id': item[0],
            'title': item[1],
            'description': item[2],
            'status': item[3],
            'date': item[4]
        } for item in items])
    except Exception as e:
        print(f"Error in get_content_items: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/content-items', methods=['POST'])
def add_content_item():
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
            
        data = request.json
        print(f"Received data: {data}")  # Debug print
        
        required_fields = ['title', 'date', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        c.execute('''
            INSERT INTO content_items (title, description, status, date)
            VALUES (?, ?, ?, ?)
        ''', (data['title'], data.get('description', ''), data['status'], data['date']))
        conn.commit()
        item_id = c.lastrowid
        conn.close()
        
        return jsonify({
            'id': item_id,
            'title': data['title'],
            'description': data.get('description', ''),
            'status': data['status'],
            'date': data['date']
        }), 201
    except Exception as e:
        print(f"Error in add_content_item: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/content-items/<int:item_id>', methods=['PUT'])
def update_content_item(item_id):
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
            
        data = request.json
        print(f"Updating item {item_id} with data: {data}")
        
        required_fields = ['title', 'date', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        c.execute('''
            UPDATE content_items 
            SET title = ?, description = ?, status = ?, date = ?
            WHERE id = ?
        ''', (data['title'], data.get('description', ''), data['status'], data['date'], item_id))
        conn.commit()
        
        if c.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Content item not found'}), 404
            
        conn.close()
        
        return jsonify({
            'id': item_id,
            'title': data['title'],
            'description': data.get('description', ''),
            'status': data['status'],
            'date': data['date']
        }), 200
    except Exception as e:
        print(f"Error in update_content_item: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/content-items/<int:item_id>', methods=['DELETE'])
def delete_content_item(item_id):
    try:
        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        c.execute('DELETE FROM content_items WHERE id = ?', (item_id,))
        conn.commit()
        
        if c.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Content item not found'}), 404
            
        conn.close()
        return jsonify({'message': 'Content item deleted successfully'}), 200
    except Exception as e:
        print(f"Error in delete_content_item: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Campaign routes
@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    try:
        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        c.execute('SELECT * FROM campaigns')
        campaigns = c.fetchall()
        conn.close()
        
        return jsonify([{
            'id': campaign[0],
            'title': campaign[1],
            'description': campaign[2],
            'status': campaign[3],
            'startDate': campaign[4],
            'endDate': campaign[5],
            'color': campaign[6]
        } for campaign in campaigns])
    except Exception as e:
        print(f"Error in get_campaigns: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/campaigns', methods=['POST'])
def add_campaign():
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
            
        data = request.json
        required_fields = ['title', 'startDate', 'endDate']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        c.execute('''
            INSERT INTO campaigns (title, description, status, startDate, endDate, color)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['title'],
            data.get('description', ''),
            data.get('status', 'Planned'),
            data['startDate'],
            data['endDate'],
            data.get('color', '#FFB3BA')
        ))
        conn.commit()
        campaign_id = c.lastrowid
        conn.close()
        
        return jsonify({
            'id': campaign_id,
            'title': data['title'],
            'description': data.get('description', ''),
            'status': data.get('status', 'Planned'),
            'startDate': data['startDate'],
            'endDate': data['endDate'],
            'color': data.get('color', '#FFB3BA')
        }), 201
    except Exception as e:
        print(f"Error in add_campaign: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Social Post routes
@app.route('/api/social-posts', methods=['GET'])
def get_social_posts():
    try:
        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        c.execute('SELECT * FROM social_posts')
        posts = c.fetchall()
        conn.close()
        
        return jsonify([{
            'id': post[0],
            'title': post[1],
            'message': post[2],
            'platforms': post[3].split(','),
            'date': post[4]
        } for post in posts])
    except Exception as e:
        print(f"Error in get_social_posts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/social-posts', methods=['POST'])
def add_social_post():
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
            
        data = request.json
        required_fields = ['title', 'message', 'platforms', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Convert platforms list to comma-separated string
        platforms = ','.join(data['platforms'])

        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        c.execute('''
            INSERT INTO social_posts (title, message, platforms, date)
            VALUES (?, ?, ?, ?)
        ''', (data['title'], data['message'], platforms, data['date']))
        conn.commit()
        post_id = c.lastrowid
        conn.close()
        
        return jsonify({
            'id': post_id,
            'title': data['title'],
            'message': data['message'],
            'platforms': data['platforms'],
            'date': data['date']
        }), 201
    except Exception as e:
        print(f"Error in add_social_post: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add PUT and DELETE routes for both
@app.route('/api/campaigns/<int:campaign_id>', methods=['PUT', 'DELETE'])
def manage_campaign(campaign_id):
    try:
        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        
        if request.method == 'DELETE':
            c.execute('DELETE FROM campaigns WHERE id = ?', (campaign_id,))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Campaign deleted successfully'}), 200
            
        if request.method == 'PUT':
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
                
            data = request.json
            c.execute('''
                UPDATE campaigns 
                SET title = ?, description = ?, status = ?, startDate = ?, endDate = ?, color = ?
                WHERE id = ?
            ''', (
                data['title'],
                data.get('description', ''),
                data.get('status', 'Planned'),
                data['startDate'],
                data['endDate'],
                data.get('color', '#FFB3BA'),
                campaign_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({**data, 'id': campaign_id}), 200
            
    except Exception as e:
        print(f"Error in manage_campaign: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/social-posts/<int:post_id>', methods=['PUT', 'DELETE'])
def manage_social_post(post_id):
    try:
        conn = sqlite3.connect('calendar.db')
        c = conn.cursor()
        
        if request.method == 'DELETE':
            c.execute('DELETE FROM social_posts WHERE id = ?', (post_id,))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Social post deleted successfully'}), 200
            
        if request.method == 'PUT':
            if not request.is_json:
                return jsonify({'error': 'Content-Type must be application/json'}), 400
                
            data = request.json
            platforms = ','.join(data['platforms'])
            
            c.execute('''
                UPDATE social_posts 
                SET title = ?, message = ?, platforms = ?, date = ?
                WHERE id = ?
            ''', (
                data['title'],
                data['message'],
                platforms,
                data['date'],
                post_id
            ))
            conn.commit()
            conn.close()
            
            return jsonify({**data, 'id': post_id}), 200
            
    except Exception as e:
        print(f"Error in manage_social_post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/link-preview')
def get_link_preview():
    url = request.args.get('url')
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        return jsonify({
            'title': soup.title.string if soup.title else '',
            'description': soup.find('meta', {'name': 'description'})['content'] if soup.find('meta', {'name': 'description'}) else '',
            'image': soup.find('meta', {'property': 'og:image'})['content'] if soup.find('meta', {'property': 'og:image'}) else '',
            'domain': urlparse(url).netloc
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Catch-all route for serving React app - Keep this AFTER API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.startswith('api/'):
        return jsonify({'error': 'Not Found'}), 404
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000) 