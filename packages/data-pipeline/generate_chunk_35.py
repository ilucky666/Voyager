import json
import os

# Chunk 35 data map
chunk_35_data = {
  "CA-PE": {
    "summary": "加拿大面积最小的省份爱德华王子岛，以绵延的红砂岩悬崖、温馨的田园牧歌风光与《绿山墙的安妮》故乡而享誉世界。这里也是加拿大联邦的发祥地，散发着安宁惬意的海洋怀抱气息。",
    "attractions": ["绿山墙农场 (Green Gables Heritage Place)", "爱德华王子岛国家公园 (Prince Edward Island National Park)", "查洛顿老城与历史遗址 (Charlottetown Historic District)", "普里姆角灯塔 (Point Prim Lighthouse)"],
    "experiences": ["在卡文迪什海滩漫步欣赏壮丽的红砂岩海岸日落", "品尝刚出锅的极品爱德华王子岛大西洋鲜活大龙虾"]
  },
  "CH-GE": {
    "summary": "伫立于日内瓦湖畔与阿尔卑斯山麓之间，日内瓦是享誉全球的国际和平之都与高级制表圣地。这里既有联合国等国际组织的宏伟气象，又散发着古典老城的浪漫韵味。",
    "attractions": ["日内瓦大喷泉 (Jet d'Eau)", "圣彼得大教堂 (St. Pierre Cathedral)", "万国宫 (Palais des Nations)", "百达翡丽博物馆 (Patek Philippe Museum)"],
    "experiences": ["乘船游览日内瓦湖观赏远方勃朗峰雪顶", "漫步老城石板路探访百年顶级制表工坊"]
  },
  "CH-JU": {
    "summary": "坐落于瑞士西北部的汝拉山脉深处，这里是瑞士精密机械与高级制表的传奇摇篮。山谷间绿树成荫，骏马成群，呈现出一幅原生态的纯净山地画卷。",
    "attractions": ["波朗特吕城堡 (Château de Porrentruy)", "杜河大峡谷自然公园 (Doubs Natural Regional Park)", "塞涅莱吉耶高山牧场 (Saignelégier)"],
    "experiences": ["在弗朗什山脉骑马穿行于辽阔的高山草甸", "探访隐藏在山谷中的百年钟表造物传奇工坊"]
  },
  "CH-NE": {
    "summary": "依偎着澄澈的纳沙泰尔湖，这座以黄色砂岩建筑著称的法文区小城，散发着法式浪漫与瑞士精致的独特魅力。这里也是世界计时技术的历史重镇。",
    "attractions": ["纳沙泰尔城堡与大教堂 (Château et Collégiale de Neuchâtel)", "拉绍德封国际钟表博物馆 (Musée international d'horlogerie)", "纳沙泰尔湖滨长廊 (Lake Neuchâtel Promenade)"],
    "experiences": ["沿纳沙泰尔湖畔骑行观赏阿尔卑斯群峰远景", "品尝当地特产的纳沙泰尔芝士火锅与精酿白葡萄酒"]
  },
  "CH-AG": {
    "summary": "阿劳所在的阿尔高州位于瑞士北部，以众多的古老城堡、温泉小镇与绿意盎然的阿雷河谷著称。这里蕴藏着哈布斯堡家族最初崛起的历史基石。",
    "attractions": ["哈布斯堡城堡 (Habsburg Castle)", "伦茨堡城堡 (Lenzburg Castle)", "巴登温泉遗址 (Baden Thermal Baths)"],
    "experiences": ["登临哈布斯堡发源城堡俯瞰河谷全景", "在巴登百年历史温泉中体验地热滋养放松身心"]
  },
  "CH-LU": {
    "summary": "琉森州位于瑞士中部的心脏地带，依山傍水，拥有标志性的水塔花桥与静谧的四森林州湖。这里是前往皮拉图斯山与铁力士山的绝佳门廊。",
    "attractions": ["卡贝尔木桥与水塔 (Chapel Bridge)", "垂死狮子像 (Lion Monument)", "皮拉图斯山 (Mount Pilatus)", "瑞士交通博物馆 (Swiss Museum of Transport)"],
    "experiences": ["乘世界上最陡峭的齿轨铁路登顶皮拉图斯山", "乘坐古老蒸汽轮船泛舟于琉森湖静谧波光中"]
  },
  "CH-NW": {
    "summary": "下瓦尔登州坐落于四森林州湖南岸，紧邻巍峨的山峦，是瑞士最早的创始州之一。这里乡村景色如画，高山缆车与徒步小径纵横交错。",
    "attractions": ["石丹峰敞篷缆车 (Stanserhorn CabriO)", "布尔根施托克度假区 (Bürgenstock Resort)", "特吕布湖 (Trübsee)"],
    "experiences": ["乘坐全球唯一的双层敞篷缆车体验登顶石丹峰的震撼", "沿布尔根施托克悬崖步道俯瞰四森林州湖全景"]
  },
  "CH-VS": {
    "summary": "瓦莱州坐拥阿尔卑斯山脉的众多四千米以上高峰，其中以形似金字塔的马特洪峰最为瞩目。这里是滑雪胜地采尔马特与韦尔比耶的所在地，也是顶级冰川列车途经的梦幻雪国。",
    "attractions": ["马特洪峰 (Matterhorn)", "采尔马特无车小镇 (Zermatt)", "阿莱奇冰川 (Aletsch Glacier)", "戈尔内格拉特观景台 (Gornergrat)"],
    "experiences": ["搭乘戈尔内格拉特登山齿轨火车倒影湖中观赏马特洪峰", "乘坐冰川快车穿行于冰雪峡谷与高山桥梁之间"]
  },
  "CH-AR": {
    "summary": "外阿彭策尔州位于瑞士东北部，以起伏的绿色丘陵、传统的木结构房屋与悠久的民间手工艺传统而闻名。这里保留着极其纯正的瑞士乡村风俗。",
    "attractions": ["黑里绍老城 (Herisau Town Center)", "施泰因民俗博物馆 (Appenzeller Folklore Museum)", "索恩尼斯山观景台 (Säntis Peak View)"],
    "experiences": ["漫步于彩绘木屋点缀的乡村小径体验传统奶酪制作", "登上索恩尼斯山顶一览六国连绵雪峰的壮观奇景"]
  },
  "CH-SG": {
    "summary": "圣加仑州位于博登湖与阿尔卑斯山脉之间，以世界文化遗产圣加仑修道院图书馆与精致的纺织刺绣工业名扬欧洲。这里历史深厚且活力充沛。",
    "attractions": ["圣加仑大教堂与修道院图书馆 (Abbey Library of Saint Gall)", "博登湖长廊 (Lake Constance Promenade)", "巴德拉加兹温泉 (Bad Ragaz)"],
    "experiences": ["踏入修道院图书馆惊叹于洛可可风格的古典木雕与古籍珍藏", "在巴德拉加兹顶级奢华温泉疗养中心享受地热温泉疗愈"]
  },
  "CH-TI": {
    "summary": "提契诺州位于阿尔卑斯山脉南麓，是瑞士唯一的意大利语州。这里阳光明媚，棕榈树与雪山交相辉映，充满了地中海风情与意式生活艺术。",
    "attractions": ["贝林佐纳三座中世纪城堡 (Castles of Bellinzona)", "卢加诺湖 (Lake Lugano)", "洛迦诺大广场 (Piazza Grande, Locarno)", "马焦雷湖 (Lake Maggiore)"],
    "experiences": ["探访世界遗产贝林佐纳城堡群感受中世纪要塞雄风", "在卢加诺湖畔棕榈树下品尝意式 gelato 享受漫生活"]
  },
  "CH-GL": {
    "summary": "格拉鲁斯州深入在狭长的阿尔卑斯山谷之中，以陡峭的高山崖壁、湍急的溪流与壮观的斯尔多纳地质结构断层而闻名于地质学界。",
    "attractions": ["克隆泰尔湖 (Klöntalersee)", "斯尔多纳地质结构区 (Swiss Tectonic Arena Sardona)", "福尔普斯山 peak (Vorder Glärnisch)"],
    "experiences": ["泛舟于山岩倒映的深绿克隆泰尔湖面感受空灵之美", "徒步斯尔多纳地质公园探寻造山运动形成的地质推覆体"]
  },
  "CH-GR": {
    "summary": "格劳宾登州是瑞士面积最大的州，也是罗曼什语的家园。这里拥有奢华度假胜地圣莫里茨、达沃斯以及充满野生动物的瑞士唯一国家公园。",
    "attractions": ["圣莫里茨 (St. Moritz)", "瑞士国家公园 (Swiss National Park)", "兰德瓦瑟高架桥 (Landwasser Viaduct)", "达沃斯 (Davos)"],
    "experiences": ["乘伯尔尼纳快车穿越高山铁路打卡兰德瓦瑟大桥", "在瑞士国家公园原始森林中追踪阿尔卑斯羱羊与野鹿"]
  },
  "CH-SH": {
    "summary": "沙夫豪森州位于瑞士最北端，几乎被德国环绕。这里拥有欧洲最大的瀑布——莱茵瀑布，以及充满文艺复兴湿壁画的古老小镇。",
    "attractions": ["莱茵瀑布 (Rhine Falls)", "米诺堡堡垒 (Munot Fortress)", "石角小镇 (Stein am Rhein)"],
    "experiences": ["乘游船近距离驶向莱茵瀑布中央巨石感受水雷轰鸣", "漫步石角小镇欣赏民居墙面上极其繁复精美的外墙湿壁画"]
  },
  "CH-SZ": {
    "summary": "施维茨州是瑞士联邦的发源地与国名来源，坐落于神圣的米滕山峰脚下。这里不仅历史地位崇高，更拥有世界最陡峭的缆车铁路。",
    "attractions": ["施维茨历史联邦博物馆 (Forum of Swiss History Schwyz)", "米滕山 (Großer Mythen)", "施托斯陡峭缆车 (Stoos Funicular)"],
    "experiences": ["乘坐倾斜度达110%的世界最陡缆车直升施托斯高原", "登上米滕山顶俯瞰四森林州湖与群山构成的壮丽画卷"]
  },
  "CH-TG": {
    "summary": "图尔高州位于瑞士东北部博登湖畔，被誉为瑞士的“苹果之州”。这里拥有连绵的果园、温和的气候与古朴的湖畔村庄。",
    "attractions": ["阿姆里斯维尔苹果果园 (Amriswil Apple Country)", "卡特豪斯伊廷根修道院 (Carthusian Monastery Ittingen)", "阿尔邦城堡 (Arbon Castle)"],
    "experiences": ["春季骑行穿过万亩苹果花盛开的博登湖乡村小径", "探访由古老修道院改建的文化中心品尝自产果酒"]
  },
  "CH-UR": {
    "summary": "乌里州坐落于哥达山口脚下，是威廉·退尔传奇故事的发生地。这里峡谷深邃，是连接瑞士南北交通的天然高山要道。",
    "attractions": ["阿尔特多夫威廉退尔雕像 (William Tell Statue in Altdorf)", "哥达山口步道 (Gotthard Pass)", "雷乌斯河谷 (Reuss Valley)"],
    "experiences": ["自驾游览险峻迷人的哥达盘山公路体验山道驾驶", "在阿尔特多夫感受瑞士英雄威廉·退尔的历史传说"]
  },
  "CH-ZH": {
    "summary": "苏黎世州是瑞士最大的经济与金融心脏，苏黎世湖与利马特河穿城而过。这里既有世界顶级的金融商圈，又有极其丰富的艺术博物馆与惬意生活。",
    "attractions": ["班霍夫大街 (Bahnhofstrasse)", "苏黎世老城区 (Old Town Zurich)", "苏黎世圣母大教堂 (Fraumünster Church)", "瑞士国家博物馆 (Swiss National Museum)"],
    "experiences": ["在班霍夫大街体验全球顶级购物与顶级巧克力品尝", "欣赏圣母大教堂内由马克·夏加尔设计的梦幻彩绘玻璃窗"]
  },
  "CH-ZG": {
    "summary": "楚格州位于楚格湖畔，是瑞士面积最小但最具经济活力的州之一。这里以低税率、加密谷科技中心以及绝美的楚格湖日落而闻名。",
    "attractions": ["楚格湖畔长廊 (Lake Zug Promenade)", "楚格城堡博物馆 (Zug Castle)", "黑利根克洛斯特修道院 (Kloster Maria Opferung)"],
    "experiences": ["黄昏时分漫步楚格湖畔观赏被誉为瑞士最美的金色日落", "登临中世纪楚格城堡塔楼鸟瞰老城红瓦与湖光山色"]
  },
  "CH-FR": {
    "summary": "弗里堡州横跨德语与法语区，拥有保存完好的中世纪古城与高山奶酪之乡格鲁耶尔。这里充满了古典建筑与醇香美食。",
    "attractions": ["弗里堡圣尼古拉大教堂 (St. Nicholas Cathedral)", "格鲁耶尔城堡 (Château de Gruyères)", "HR Giger 异形博物馆 (HR Giger Museum)"],
    "experiences": ["在格鲁耶尔小镇品尝正宗的瑞士格鲁耶尔奶酪火锅", "打卡《异形》电影主创设立的暗黑科幻风格异形博物馆"]
  },
  "CH-VD": {
    "summary": "沃州位于日内瓦湖北岸，拥有世界遗产拉沃葡萄园梯田、爵士之都蒙特勒与雄伟的西庸城堡。这里气候宜人，是名流流连的日内瓦湖里维埃拉。",
    "attractions": ["拉沃葡萄园梯田 (Lavaux Vineyards)", "西庸城堡 (Chillon Castle)", "洛桑奥林匹克博物馆 (Olympic Museum)", "蒙特勒湖畔长廊 (Montreux Promenade)"],
    "experiences": ["漫步于拉沃葡萄园梯田品尝日内瓦湖畔特产白葡萄酒", "参观浮于湖水之上的西庸古堡感受拜伦诗中的历史沉淀"]
  },
  "CH-BL": {
    "summary": "巴塞尔乡村州环绕着巴塞尔市，延伸至汝拉山脉起伏的丘陵之中。这里拥有罗马时代古城遗迹、绿意盎然的樱花林与乡村城堡。",
    "attractions": ["奥古斯塔·拉乌里卡罗马遗迹 (Augusta Raurica)", "利斯塔尔老城 (Liestal Old Town)", "瓦尔登堡城堡 (Waldenburg Castle)"],
    "experiences": ["在古罗马遗迹 Augusta Raurica 露天剧场感悟千年前的古罗马文明", "春天骑行于樱花盛开的丘陵山谷间打卡乡村城堡"]
  },
  "CH-BE": {
    "summary": "伯尔尼州是瑞士联邦政府所在地，拥有世界遗产伯尔尼老城、少女峰地区以及阿伦河弯道。这里集政治心脏与顶级高山风光于一体。",
    "attractions": ["伯尔尼老城与钟楼 (Bern Old Town & Zytglogge)", "少女峰与冰川 (Jungfraujoch)", "因特拉肯 (Interlaken)", "格林德瓦 (Grindelwald)"],
    "experiences": ["乘高山齿轨火车登顶欧洲之巅少女峰观赏阿莱奇冰川", "漫步伯尔尼拱廊老城探访熊公园与埃尔温·爱因斯坦故居"]
  },
  "CH-BS": {
    "summary": "巴塞尔城市州位于瑞士、法国与德国交界的莱茵河畔，是瑞士的文化艺术与生物医药之都。这里拥有众多的顶级博物馆与巴塞尔艺术展。",
    "attractions": ["巴塞尔大教堂 (Basel Minster)", "巴塞尔艺术博物馆 (Kunstmuseum Basel)", "拜尔勒基金会博物馆 (Fondation Beyeler)", "三国交界碑 (Dreiländereck)"],
    "experiences": ["在夏日像当地人一样将衣物装入防水包顺莱茵河漂流", "在世界级的拜尔勒基金会博物馆欣赏大师级现代艺术珍藏"]
  },
  "CH-SO": {
    "summary": "索洛图恩州位于阿雷河畔，被誉为瑞士最美丽的巴洛克小镇。这里的建筑、教堂与历史深受数字“11”的神奇文化影响。",
    "attractions": ["圣乌尔苏斯大教堂 (St. Ursus Cathedral)", "维森施泰因山 (Weissenstein)", "瓦尔德堡城堡 (Waldegg Castle)"],
    "experiences": ["攀登圣乌尔苏斯大教堂的111级阶梯感受奇妙的巴洛克数字文化", "乘坐缆车登顶维森施泰因山俯瞰阿尔卑斯山脉连绵全景"]
  },
  "CH-OW": {
    "summary": "上瓦尔登州坐落于瑞士几何中心，拥有静谧的萨尔嫩湖与修道院小镇恩格尔贝格。这里是前往铁力士山滑雪与观光的天然基点。",
    "attractions": ["恩格尔贝格修道院 (Engelberg Abbey)", "铁力士山 (Mount Titlis)", "萨尔嫩湖 (Lake Sarnen)", "龙疆湖 (Lake Lungern)"],
    "experiences": ["乘坐360度旋转缆车登顶铁力士山体验冰川悬索桥", "在碧绿如玉的龙疆湖畔漫步打卡童话般的乡村木屋"]
  },
  "CH-AI": {
    "summary": "内阿彭策尔州是瑞士面积第二小的州，首府阿彭策尔以彩绘木屋街道与极其保守传统的露天民主集会 (Landsgemeinde) 而闻名。",
    "attractions": ["阿彭策尔彩绘老街 (Appenzell Village)", "阿尔普施泰因山脉 (Alpstein Range)", "埃舍尔悬崖客栈 (Äscher Cliff Restaurant)"],
    "experiences": ["徒步前往悬挂在几百米绝壁上的埃舍尔悬崖客栈喝一杯咖啡", "漫步于阿彭策尔主街打卡色彩斑斓的木结构民居艺术"]
  },
  "CL-AI": {
    "summary": "伊瓦涅斯将军的艾森大区位于智利巴塔哥尼亚北部，以湍急的河谷、巍峨的冰川与独特的卡雷拉将军湖大理石洞穴而闻名于世。",
    "attractions": ["大理石教堂洞穴 (Marble Caves / Capillas de Mármol)", "圣拉斐尔冰川国家公园 (San Rafael Glacier National Park)", "南方公路 (Carretera Austral)"],
    "experiences": ["乘小船驶入卡雷拉将军湖中被湖水雕琢的幻彩大理石洞穴", "自驾极具挑战性的智利南方公路穿越壮丽的巴塔哥尼亚荒野"]
  },
  "CL-MA": {
    "summary": "麦哲伦-智利南极大区位于南美洲最南端，拥有世界级徒步圣地百内国家公园、麦哲伦海峡以及通往南极大陆的天然门户蓬塔阿雷纳斯。",
    "attractions": ["百内国家公园 (Torres del Paine National Park)", "麦哲伦海峡 (Strait of Magellan)", "蓬塔阿雷纳斯 (Punta Arenas)", "企鹅岛 (Isla Magdalena)"],
    "experiences": ["在百内国家公园完成经典的“W”线徒步打卡百内三塔", "乘船前往马格达莱纳岛与数万只麦哲伦企鹅近距离接触"]
  },
  "CL-TA": {
    "summary": "塔拉帕卡大区位于智利北部阿塔卡马沙漠边缘，临太平洋，拥有历史悠久的硝石矿遗址与充满沙漠风情的伊基克海滨。",
    "attractions": ["亨伯斯通硝石采矿厂遗址 (Humberstone and Santa Laura Saltpeter Works)", "伊基克海滩 (Zofri & Cavancha Beach)", "阿塔卡马巨人地画 (Atacama Giant)"],
    "experiences": ["探访世界遗产亨伯斯通鬼城感受19世纪硝石狂热的历史沧桑", "在伊基克海岸体验太平洋风帆冲浪与沙漠滑沙的双重刺激"]
  },
  "CL-AP": {
    "summary": "阿里卡和帕里纳科塔大区位于智利最北端，紧邻秘鲁与玻利维亚。这里有永春之城阿里卡、高海拔拉乌卡国家公园与神秘的安第斯高原湖泊。",
    "attractions": ["拉乌卡国家公园 (Lauca National Park)", "阿里卡圣马科斯教堂 (Cathedral of San Marcos, Arica)", "钟湖 (Lake Chungará)"],
    "experiences": ["前往海拔超过4500米的钟湖观赏倒映在湖水中的帕里纳科塔雪山", "在阿里卡海滨打卡由埃菲尔铁塔设计师建造的铁皮圣马科斯教堂"]
  },
  "CL-AN": {
    "summary": "安托法加斯塔大区是智利重要的铜矿产区与沙漠门户，拥有效应超现实的安托法加斯塔天然石拱门与阿塔卡马沙漠天文观星基地。",
    "attractions": ["波托拉天然石拱 (La Portada)", "沙漠之手雕塑 (Mano del Desierto)", "阿塔卡马大型毫米波阵列 (ALMA Observatory)"],
    "experiences": ["在辽阔无垠的沙漠公路旁与耸立在荒漠中的“沙漠之手”合影", "在拥有极致晴朗夜空的沙漠深处体验全球最顶级的星空观赏"]
  },
  "CL-AT": {
    "summary": "阿塔卡马大区拥有世界上最干燥的阿塔卡马沙漠核心区，以及罕见的“沙漠开花”自然奇迹与美丽的内格拉海滩。",
    "attractions": ["潘德阿苏卡尔国家公园 (Pan de Azúcar National Park)", "内格拉海湾 (Bahía Inglesa)", "奥霍斯-德尔萨拉多山 (Ojos del Salado)"],
    "experiences": ["在罕见的雨水过后观赏广袤荒漠瞬间化作粉色花海的自然奇迹", "在巴希亚英格莱萨白沙滩品尝新鲜采捞的智利野生扇贝"]
  },
  "CL-CO": {
    "summary": "科金博大区以双子城拉塞雷纳和科金博为中心，拥有延伸至安第斯山脉的埃尔基山谷，这里是智利皮斯科蒸馏酒产地与天文观星圣地。",
    "attractions": ["埃尔基山谷 (Elqui Valley)", "拉塞雷纳灯塔 (La Serena Lighthouse)", "平岛企鹅国家保护区 (Pingüino de Humboldt National Reserve)"],
    "experiences": ["在埃尔基山谷的清澈星空下品尝正宗的智利皮斯科酸酒 (Pisco Sour)", "乘船前往平岛国家保护区观赏野生汉堡企鹅与海狮"]
  },
  "CL-RM": {
    "summary": "圣地亚哥首都大区是智利的政治、经济与文化中心，雄伟的安第斯雪山环抱城郭。这里既有殖民风情老城，又有顶级安第斯葡萄酒庄。",
    "attractions": ["武器广场 (Plaza de Armas)", "圣克里斯托瓦尔山 (San Cristóbal Hill)", "智利前哥伦布艺术博物馆 (Chilean Museum of Pre-Columbian Art)", "干露酒庄 (Concha y Toro Winery)"],
    "experiences": ["乘坐缆车登上圣克里斯托瓦尔山顶俯瞰圣地亚哥城与雪山交映", "探访百年干露酒庄地下酒窖品鉴顶级卡曼尼 (Carmenère) 红葡萄酒"]
  },
  "CL-VS": {
    "summary": "瓦尔帕莱索大区拥有迷幻的彩色山城港口瓦尔帕莱索、花园城市比尼亚德尔马，以及远在太平洋深处的神秘复活节岛。",
    "attractions": ["瓦尔帕莱索彩色山城 (Valparaíso Cultural Park & Elevators)", "复活节岛摩艾石像 (Rapa Nui / Easter Island Moai)", "比尼亚德尔马花钟 (Viña del Mar Flower Clock)"],
    "experiences": ["乘坐古老悬崖升降梯穿梭于瓦尔帕莱索涂鸦街区之间", "飞往复活节岛在阿胡通加里基 (Ahu Tongariki) 迎着日出瞻仰巨大的摩艾石像"]
  },
  "CL-AR": {
    "summary": "阿劳卡尼亚大区是马普切 (Mapuche) 原住民文化的摇篮，拥有雄伟的维利亚里卡活火山、蔚蓝的湖泊与珍稀的南洋杉原始森林。",
    "attractions": ["维利亚里卡火山 (Villarrica Volcano)", "普孔小镇 (Pucón)", "孔吉利奥国家公园 (Conguillío National Park)"],
    "experiences": ["在湖光山色环抱的普孔小镇体验攀登活火山与火山温泉", "徒步孔吉利奥公园穿越古老的猴迷树 (Araucaria) 原始森林"]
  },
  "CL-LR": {
    "summary": "洛斯里奥斯大区以“河流之大区”著称，首府瓦尔迪维亚拥有一流的德式酿酒传统、清澈的河道与沿海的海狮集市。",
    "attractions": ["瓦尔迪维亚河流集市 (Mercado Fluvial de Valdivia)", "卡尼尔国家公园 (Oncol Park)", "科尔布斯城堡遗址 (Niebla Fort)"],
    "experiences": ["在瓦尔迪维亚河畔集市观看庞大的野生海狮抢食鱼杂", "品尝深受德国移民文化影响的正宗智利精酿啤酒与德式糕点"]
  },
  "CL-BI": {
    "summary": "比比奥大区是智利中南部的工业与大学城重镇，拥有宽广的比比奥河、历史悠久的康塞普西翁以及壮丽的安第斯山麓瀑布。",
    "attractions": ["康塞普西翁大学城 (Universidad de Concepción)", "拉查瀑布 (Salto del Laja)", "比比奥河口 (Bío-Bío River Mouth)"],
    "experiences": ["在壮观的拉查瀑布前感受万马奔腾般的水雾与彩虹", "漫步于康塞普西翁壁画艺术长廊感受智利浓郁的左翼文学艺术底蕴"]
  },
  "CL-LI": {
    "summary": "奥希金斯将军解放者大区是智利传统农业与马术牛仔文化 (Huasos) 的核心区，拥有著名的科尔查瓜山谷顶级葡萄酒产区。",
    "attractions": ["科尔查瓜山谷 (Colchagua Valley)", "斯维尔铜矿小镇遗址 (Sewell Mining Town)", "拉查波阿尔河谷 (Cachapoal Valley)"],
    "experiences": ["探访世界遗产斯维尔彩楼铜矿鬼城感悟安第斯山脉采矿历史", "乘坐古董马车穿梭于科尔查瓜山谷葡萄园品尝顶尖赤霞珠"]
  }
}

# Write chunk_35_result.json
chunk_35_path = r'C:\Users\asus\.gemini\antigravity\brain\7dead33a-72d5-45b4-9654-8c1de40c68ee\subagent_jobs\chunk_35_result.json'
with open(chunk_35_path, 'w', encoding='utf-8') as f:
    json.dump(chunk_35_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated chunk 35 result with {len(chunk_35_data)} items!")

# Merge into province-details.json immediately
details_path = r'f:\LIBRARY\Studio\apps\voyager\public\geo\province-details.json'
with open(details_path, 'r', encoding='utf-8') as f:
    details = json.load(f)

merged_count = 0
for code, data in chunk_35_data.items():
    if code in details:
        details[code]['summary'] = data['summary']
        details[code]['attractions'] = data['attractions']
        details[code]['experiences'] = data['experiences']
        merged_count += 1
    else:
        # Create entry if missing
        details[code] = {
            "name": code,
            "nameEn": code,
            "country": "",
            "countryCode": code.split('-')[0],
            "summary": data['summary'],
            "attractions": data['attractions'],
            "heritage": [],
            "experiences": data['experiences']
        }
        merged_count += 1

with open(details_path, 'w', encoding='utf-8') as f:
    json.dump(details, f, ensure_ascii=False, indent=2)

print(f"Successfully merged {merged_count} entries into province-details.json!")
