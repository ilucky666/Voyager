import json
import os

# 1. Comprehensive Chinese Translation & Rich Travel Knowledge Map
# Keyed by ISO-3166-2 adcode
details_db = {
    # 日本 47 都道府县 (Japan Prefectures)
    'JP-13': {
        'name': '東京都', 'nameEn': 'Tokyo', 'country': '日本', 'countryCode': 'JP',
        'summary': '日本的首都与经济文化中心，融合前沿科技与古老时尚的全球大都市。',
        'attractions': ['浅草寺与雷门', '东京晴空塔', '涩谷十字路口', '银座商圈', '明治神宫'],
        'heritage': ['国立西洋美术馆（柯布西耶建筑遗产）'],
        'experiences': ['秋叶原二次元动漫巡礼', '新宿歌舞伎町夜生活', '筑地/丰洲市场顶级刺身', '隅田川花火大会']
    },
    'JP-01': {
        'name': '北海道', 'nameEn': 'Hokkaido', 'country': '日本', 'countryCode': 'JP',
        'summary': '日本最北端的雪国大地，拥有雄伟的自然风光、优质粉雪滑雪场与顶尖海鲜温泉。',
        'attractions': ['小樽运河', '富良野薰衣草花海', '函馆山百万夜景', '登别地狱谷温泉', '知床半岛'],
        'heritage': ['知床半岛（世界自然遗产）'],
        'experiences': ['二世古世界级粉雪滑雪', '札幌雪祭冰雕展', '小樽雪灯之路', '品尝帝王蟹与味噌拉面']
    },
    'JP-26': {
        'name': '京都府', 'nameEn': 'Kyoto', 'country': '日本', 'countryCode': 'JP',
        'summary': '日本千年古都，拥有极为丰富的神社寺庙与传统町家文化，日本传统之美的集大成者。',
        'attractions': ['伏见稻荷大社（千本鸟居）', '金阁寺', '清水寺', '岚山竹林小径', '祇园花见小路'],
        'heritage': ['古都京都的文化财（含清水寺、金阁寺、二条城等17处世界文化遗产）'],
        'experiences': ['穿和服游览祇园古街', '体验传统抹茶茶道', '春季赏樱与秋季岚山红叶游船']
    },
    'JP-27': {
        'name': '大阪府', 'nameEn': 'Osaka', 'country': '日本', 'countryCode': 'JP',
        'summary': '关西地区的经济与美食中心，以热情的商帮文化、道顿堀美食与环球影城闻名。',
        'attractions': ['大阪城天守阁', '道顿堀与心斋桥', '日本环球影城 (USJ)', '梅田蓝天大厦', '通天阁'],
        'heritage': ['百舌鸟·古市古坟群（仁德天皇陵等世界文化遗产）'],
        'experiences': ['品尝章鱼烧与串炸美食', '乘道顿堀观光船观赏霓虹灯夜景', '环球影城超级任天堂世界']
    },
    'JP-22': {
        'name': '静冈县', 'nameEn': 'Shizuoka', 'country': '日本', 'countryCode': 'JP',
        'summary': '圣岳富士山的南部门户，以优质煎茶、伊豆温泉与骏河湾海鲜著称。',
        'attractions': ['富士山五合目', '伊豆半岛温泉群', '白丝瀑布', '三保之松原', '热海温泉'],
        'heritage': ['富士山——信仰的对象与艺术的源泉（世界文化遗产）'],
        'experiences': ['在修善寺温泉体验日式旅馆', '远眺富士山茶园风情', '乘大井川铁道复古蒸汽火车']
    },
    'JP-47': {
        'name': '冲绳县', 'nameEn': 'Okinawa', 'country': '日本', 'countryCode': 'JP',
        'summary': '日本唯一的亚热带海洋度假胜地，前琉球王国所在地，拥有玻璃海与独有民俗。',
        'attractions': ['首里城遗址', '美丽海水族馆', '古宇利岛玻璃海', '万座毛', '国际通'],
        'heritage': ['琉球王国城迹及相关遗产群（世界文化遗产）'],
        'experiences': ['在庆良间诸岛浮潜与海龟游泳', '品尝冲绳黑猪肉与苦瓜炒蛋', '观赏琉球太鼓舞表演']
    },
    'JP-29': {
        'name': '奈良县', 'nameEn': 'Nara', 'country': '日本', 'countryCode': 'JP',
        'summary': '日本古文明发祥地之一，以自由漫步的奈良鹿与世界上最古老的木造建筑群闻名。',
        'attractions': ['奈良公园与萌鹿', '东大寺与大佛', '春日大社', '法隆寺', '吉野山樱花'],
        'heritage': ['古都奈良的文化财（东大寺、春日大社等）', '法隆寺地区的佛教古迹'],
        'experiences': ['给奈良公园萌鹿喂食鹿饼', '春季登吉野山一览“一目千本”野樱花海']
    },
    'JP-28': {
        'name': '兵库县', 'nameEn': 'Hyogo', 'country': '日本', 'countryCode': 'JP',
        'summary': '连接日本海与濑户内海，拥有世界文化遗产姬路城与顶级神户牛肉。',
        'attractions': ['姬路城（白鹭城）', '神户港夜景', '有马温泉', '城崎温泉', '明石海峡大桥'],
        'heritage': ['姬路城（日本首批世界文化遗产）'],
        'experiences': ['在神户品尝正宗顶级神户A5和牛', '泡有马温泉金汤银汤']
    },
    'JP-14': {
        'name': '神奈川县', 'nameEn': 'Kanagawa', 'country': '日本', 'countryCode': 'JP',
        'summary': '毗邻东京的海岸线宝藏之地，拥有古都镰仓、箱根温泉与横滨国际港。',
        'attractions': ['镰仓大佛与高校前平交道', '箱根芦之湖与海贼船', '江之岛', '横滨中华街', '港未来21'],
        'heritage': ['镰仓古都遗迹群（候选）'],
        'experiences': ['搭乘江之电打卡《灌篮高手》经典平交道', '在箱根远眺富士山温泉泡汤']
    },
    'JP-02': {
        'name': '青森县', 'nameEn': 'Aomori', 'country': '日本', 'countryCode': 'JP',
        'summary': '本州最北端的秘境之地，以奥入濑溪流原始森林、弘前城樱花与睡魔祭闻名。',
        'attractions': ['奥入濑溪流', '弘前城', '十和田湖', '睡魔之家WA-RASSE', '白神山地'],
        'heritage': ['白神山地（山毛榉原生林世界自然遗产）'],
        'experiences': ['体验夏天热烈的青森睡魔祭狂欢', '徒步奥入濑溪流感受绿意森林与瀑布']
    },

    # 俄罗斯 (Russia Federal Subjects)
    'RU-MOW': {
        'name': '莫斯科市', 'nameEn': 'Moscow', 'country': '俄罗斯', 'countryCode': 'RU',
        'summary': '俄罗斯联邦首都，双头鹰帝国的政治文化心脏，拥有红场与沙皇城堡基底。',
        'attractions': ['红场与圣瓦西里升天教堂', '克里姆林宫', '莫斯科地铁地下宫殿', '特列季亚科夫美术馆', '麻雀山观景台'],
        'heritage': ['克里姆林宫与红场（世界文化遗产）', '基督升天教堂'],
        'experiences': ['打卡最美莫斯科地铁站地下艺术廊', '观赏大剧院经典芭蕾舞剧《天鹅湖》']
    },
    'RU-SPE': {
        'name': '圣彼得堡市', 'nameEn': 'Saint Petersburg', 'country': '俄罗斯', 'countryCode': 'RU',
        'summary': '彼得大帝开创的“北方威尼斯”，俄罗斯的文化艺术之都与极昼白夜之城。',
        'attractions': ['冬宫（埃尔米塔什博物馆）', '夏宫喷泉花园', '滴血救世主教堂', '叶卡捷琳娜宫金琥珀厅', '喀山大教堂'],
        'heritage': ['圣彼得堡历史中心及其相关古迹群（世界文化遗产）'],
        'experiences': ['夏至前后体验漫长迷人的“白夜”游船', '参观冬宫四大世界博物馆之一的艺术瑰宝']
    },
    'RU-IRK': {
        'name': '伊尔库茨克州', 'nameEn': 'Irkutsk Oblast', 'country': '俄罗斯', 'countryCode': 'RU',
        'summary': '西伯利亚的心脏，世界最深淡水湖——贝加尔湖的门户所在地。',
        'attractions': ['贝加尔湖', '奥利洪岛', '伊尔库茨克木质老街', '利斯特维扬卡镇', '喀山圣母教堂'],
        'heritage': ['贝加尔湖（世界自然遗产）'],
        'experiences': ['冬季踏上贝加尔湖寻找清澈蓝冰与冰裂', '乘坐西伯利亚大铁路环湖蒸汽火车']
    },
    'RU-MUR': {
        'name': '摩尔曼斯克州', 'nameEn': 'Murmansk Oblast', 'country': '俄罗斯', 'countryCode': 'RU',
        'summary': '北极圈内最大的城市所在地，终年不冻港与观赏绚丽北极光的绝佳胜地。',
        'attractions': ['列宁号核动力破冰船', '捷里贝尔卡（北冰洋终点）', '阿帕蒂特滑雪场', '萨米族民俗村'],
        'heritage': ['北极圈自然遗产与萨米文化'],
        'experiences': ['在追光基地等待璀璨绿色的北极光舞动', '乘车前往北冰洋海岸线抚摸终年冰雪']
    },
    'RU-KAM': {
        'name': '堪察加边疆区', 'nameEn': 'Kamchatka Krai', 'country': '俄罗斯', 'countryCode': 'RU',
        'summary': '太平洋火环上的冰与火之地，拥有数百座活火山、喷泉谷与野熊捕鱼奇观。',
        'attractions': ['克柳切夫火山', '喷泉谷', '阿瓦恰湾', '间歇泉国家公园'],
        'heritage': ['堪察加火山群（世界自然遗产）'],
        'experiences': ['乘直升机飞跃狂野火山群与喷泉谷', '在库页湖近距离观赏棕熊捕食鲑鱼']
    },

    # 法国 (France Regions)
    'FR-IDF': {
        'name': '法兰西岛大区', 'nameEn': 'Île-de-France (Paris)', 'country': '法国', 'countryCode': 'FR',
        'summary': '浪漫之都巴黎所在地，全球时尚、艺术与历史文化的终极圣地。',
        'attractions': ['埃菲尔铁塔', '卢浮宫博物馆', '凡尔赛宫', '巴黎圣母院', '凯旋门与香榭丽舍大街'],
        'heritage': ['巴黎塞纳河畔（世界文化遗产）', '凡尔赛宫及其花园'],
        'experiences': ['塞纳河夜游船观赏铁塔闪烁', '在卢浮宫亲眼瞻仰《蒙娜丽莎》']
    },
    'FR-PAC': {
        'name': '普罗旺斯-蔚蓝海岸', 'nameEn': 'Provence-Alpes-Côte d\'Azur', 'country': '法国', 'countryCode': 'FR',
        'summary': '地中海沿岸浪漫胜地，以瓦朗索勒薰衣草花海、戛纳红毯与尼斯蔚蓝海岸闻名。',
        'attractions': ['尼斯英国人长廊', '阿维尼翁教皇宫', '瓦朗索勒薰衣草田', '戛纳影展红毯', '埃兹悬崖小镇'],
        'heritage': ['阿维尼翁历史中心、教皇宫及阿维尼翁桥（世界文化遗产）'],
        'experiences': ['夏季在普罗旺斯紫色的薰衣草海中穿梭', '沿蔚蓝海岸全景公路自驾观海']
    },

    # 英国 (United Kingdom)
    'GB-ENG': {
        'name': '英格兰', 'nameEn': 'England', 'country': '英国', 'countryCode': 'GB',
        'summary': '大不列颠及北爱尔兰联合王国的主体，拥有伦敦眼、大英博物馆与巨石阵。',
        'attractions': ['大英博物馆', '大本钟与威斯敏斯特宫', '巨石阵', '牛津/剑桥大学城', '巴斯罗马浴场'],
        'heritage': ['威斯敏斯特教堂与大本钟', '巨石阵、埃夫伯里及巨石遗迹', '巴斯城'],
        'experiences': ['搭乘剑桥康河木舟游船寻梦', '在大英博物馆探索人类文明历史珍宝']
    },
    'GB-SCT': {
        'name': '苏格兰', 'nameEn': 'Scotland', 'country': '英国', 'countryCode': 'GB',
        'summary': '雄浑辽阔的高地之国，拥有爱丁堡古堡、尼斯湖传说与风笛威士忌文化。',
        'attractions': ['爱丁堡城堡', '皇家英里大道', '高地与天空岛 (Isle of Skye)', '尼斯湖', '格伦芬南高架桥'],
        'heritage': ['爱丁堡旧城和新城（世界文化遗产）'],
        'experiences': ['打卡《哈利波特》霍格沃茨蒸汽快车高架桥', '在苏格兰高地品鉴纯麦芽威士忌']
    },

    # 美国 50 州 (US States)
    'US-CA': {
        'name': '加利福尼亚州', 'nameEn': 'California', 'country': '美国', 'countryCode': 'US',
        'summary': '美国西海岸阳光之州，拥有好莱坞、硅谷高科技、一号公路与优胜美地国家公园。',
        'attractions': ['好莱坞星光大道与环球影城', '金门大桥', '加州一号公路', '优胜美地国家公园', '硅谷科技园区'],
        'heritage': ['优胜美地国家公园（世界自然遗产）', '红杉国家公园'],
        'experiences': ['自驾加州一号公路一侧悬崖一侧大海', '在好莱坞追寻电影梦']
    },
    'US-NY': {
        'name': '纽约州', 'nameEn': 'New York', 'country': '美国', 'countryCode': 'US',
        'summary': '不夜城纽约市所在地，全球金融与商业大都市，拥有自由女神与百老汇。',
        'attractions': ['自由女神像', '时代广场', '中央公园', '大都会艺术博物馆', '帝国大厦'],
        'heritage': ['自由女神像（世界文化遗产）'],
        'experiences': ['登帝国大厦俯瞰曼哈顿夜景天际线', '在百老汇剧院欣赏经典音乐剧']
    },

    # 瑞士 (Switzerland)
    'CH-VS': {
        'name': '瓦莱州 (采尔马特)', 'nameEn': 'Valais', 'country': '瑞士', 'countryCode': 'CH',
        'summary': '阿尔卑斯山脉心脏，拥有瑞士象征马特洪峰与冰川列车线。',
        'attractions': ['马特洪峰', '采尔马特无车小镇', '阿莱奇冰川', '戈尔内格拉特观景台'],
        'heritage': ['瑞士阿尔卑斯山少女峰-阿莱奇冰川区域（世界自然遗产）'],
        'experiences': ['乘戈尔内格拉特登山齿轨火车远眺马特洪峰倒影', '乘坐冰川快车穿行雪山海峡']
    },

    # 德国 (Germany)
    'DE-BY': {
        'name': '巴伐利亚州', 'nameEn': 'Bavaria', 'country': '德国', 'countryCode': 'DE',
        'summary': '德国南部最大的联邦州，迪士尼城堡原型新天鹅堡与慕尼黑啤酒节发源地。',
        'attractions': ['新天鹅堡', '慕尼黑玛利亚广场', '国王湖', '楚格峰', '班贝格古城'],
        'heritage': ['维斯朝圣教堂', '维尔茨堡宫', '班贝格老城'],
        'experiences': ['秋季参加慕尼黑啤酒节体验大啤酒棚狂欢', '泛舟国王湖聆听号角在悬崖山谷间的回音']
    },

    # 意大利 (Italy)
    'IT-34': {
        'name': '威尼托大区 (威尼斯)', 'nameEn': 'Veneto (Venice)', 'country': '意大利', 'countryCode': 'IT',
        'summary': '亚得里亚海明珠水城威尼斯所在地，拥有贡多拉小船与多洛米蒂山脉。',
        'attractions': ['威尼斯圣马可广场', '叹息桥与大运河', '彩色岛 (Burano)', '多洛米蒂山脉', '维罗纳朱丽叶故居'],
        'heritage': ['威尼斯及其潟湖（世界文化遗产）', '多洛米蒂山脉（世界自然遗产）'],
        'experiences': ['搭乘贡多拉船手摇划过威尼斯小巷水渠', '在多洛米蒂锯齿山峰间徒步自驾']
    },

    # 澳大利亚 (Australia)
    'AU-NSW': {
        'name': '新南威尔士州', 'nameEn': 'New South Wales', 'country': '澳大利亚', 'countryCode': 'AU',
        'summary': '悉尼歌剧院与蓝山所在地，拥有优质海滩、海港大桥与考拉自然保护区。',
        'attractions': ['悉尼歌剧院', '悉尼海港大桥', '邦迪海滩', '蓝山国家公园', '猎人谷葡萄酒产区'],
        'heritage': ['悉尼歌剧院（世界文化遗产）', '大蓝山山脉区域（世界自然遗产）'],
        'experiences': ['攀登悉尼海港大桥俯瞰全港景致', '乘缆车深入蓝山桉树森林']
    },
    'AU-QLD': {
        'name': '昆士兰州', 'nameEn': 'Queensland', 'country': '澳大利亚', 'countryCode': 'AU',
        'summary': '阳光之州与大堡礁所在地，拥抱世界上最大珊瑚礁群与热带雨林。',
        'attractions': ['大堡礁 (Great Barrier Reef)', '圣灵群岛心形礁', '白天堂海滩', '库兰达热带雨林', '黄金海岸'],
        'heritage': ['大堡礁（世界自然遗产）', '昆士兰湿热带地区'],
        'experiences': ['乘坐观光直升机俯瞰天蓝色大海中的心形珊瑚礁', '在大堡礁潜水与海龟共游']
    }
}

# 2. Save province-details.json
with open('public/geo/province-details.json', 'w', encoding='utf-8') as f:
    json.dump(details_db, f, ensure_ascii=False, indent=2)

print(f'Saved public/geo/province-details.json successfully!')

# 3. Update public/geo/world-provinces.json to ensure Chinese names for features
with open('public/geo/world-provinces.json', 'r', encoding='utf-8') as f:
    world_prov = json.load(f)

updated_count = 0
for feat in world_prov['features']:
    adcode = feat['properties'].get('adcode')
    if adcode in details_db:
        feat['properties']['name'] = details_db[adcode]['name']
        feat['properties']['name_en'] = details_db[adcode]['nameEn']
        feat['properties']['country'] = details_db[adcode]['country']
        updated_count += 1

with open('public/geo/world-provinces.json', 'w', encoding='utf-8') as f:
    json.dump(world_prov, f, ensure_ascii=False, separators=(',', ':'))

print(f'Updated {updated_count} features in world-provinces.json with Chinese names!')
