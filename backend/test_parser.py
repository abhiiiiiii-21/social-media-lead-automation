import re

def parse_meta_description(desc: str):
    if not desc:
        return {}
    desc = desc.strip()
    
    caption = None
    m_cap = re.search(r':\s*["“](.*)["”][\s\.]*$', desc, re.DOTALL)
    if m_cap:
        caption = m_cap.group(1).strip()
    elif ':"' in desc:
        parts = desc.split(':"', 1)
        if len(parts) > 1:
            caption = parts[1].rstrip('". ').strip()
    elif ': "' in desc:
        parts = desc.split(': "', 1)
        if len(parts) > 1:
            caption = parts[1].rstrip('". ').strip()
            
    likes = 0
    m_likes = re.search(r'([\d\.,]+[KkMmBb]?)\s+likes', desc)
    if m_likes:
        likes_str = m_likes.group(1).replace(',', '')
        if likes_str.lower().endswith('k'):
            likes = int(float(likes_str[:-1]) * 1000)
        elif likes_str.lower().endswith('m'):
            likes = int(float(likes_str[:-1]) * 1000000)
        elif likes_str.lower().endswith('b'):
            likes = int(float(likes_str[:-1]) * 1000000000)
        else:
            try:
                likes = int(float(likes_str))
            except Exception:
                likes = 0
                
    comments = 0
    m_comm = re.search(r'([\d\.,]+[KkMmBb]?)\s+comments', desc)
    if m_comm:
        comm_str = m_comm.group(1).replace(',', '')
        if comm_str.lower().endswith('k'):
            comments = int(float(comm_str[:-1]) * 1000)
        elif comm_str.lower().endswith('m'):
            comments = int(float(comm_str[:-1]) * 1000000)
        else:
            try:
                comments = int(float(comm_str))
            except Exception:
                comments = 0
                
    hashtags = re.findall(r'#(\w+)', caption) if caption else []
    hashtags = [f"#{h}" for h in hashtags]
    
    mentions = re.findall(r'@([a-zA-Z0-9_\.]+)', caption) if caption else []
    mentions = [f"@{m}" for m in mentions]
    
    return {
        "caption": caption if caption else None,
        "likes": likes,
        "comments": comments,
        "hashtags": hashtags,
        "mentions": mentions
    }

samples = [
    '195K likes, 2,098 comments - mizoislive on August 2, 2026: "Postcards from French Riveria \n.\n.\n.\n.\n.\n#france #paris #explore #fyp #trendingpost". ',
    '226K likes, 1,719 comments - mizoislive on July 22, 2026: "Galaxy Unpacked went like.. \n\n#galaxyunpacked #teamgalaxy #samsung #galaxyzfold8". ',
    '166K likes, 1,030 comments - mizoislive on July 23, 2026: "#collaboration Ab game bhi smooth, aur flex bhi 😎\n\n#galaxyunpacked \n#teamgalaxy \n#samsung \n#galaxyzfold8". ',
    '409K likes, 3,097 comments - mizoislive on December 27, 2025: "Calm waves, Serene days ☀️🕊️\n.\n.\n.\n.\n.\n#mauritius #travel #tourism". ',
    '252K likes, 1,304 comments - mizoislive on July 9, 2026: "boy bye 👋🏻\n.\n.\n.\n.\n.\n#fyp #explorepage #foryou #black #trendingnow". ',
    '87K likes, 574 comments - mizoislive on July 20, 2026: "Dattebayo! 🍥 Naruto Shippuden is now streaming in Hindi, exclusively on Crunchyroll.\n\n#narutoshippuden #crunchyroll #crunchyrollindia #AnimeIndia #animefans". '
]

for s in samples:
    p = parse_meta_description(s)
    print("-----------------------------------------")
    print("Likes:", p["likes"], "| Comments:", p["comments"])
    print("Hashtags:", p["hashtags"])
    print("Mentions:", p["mentions"])
    print("Caption:", repr(p["caption"]))
