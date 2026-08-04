import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Detailed regional database and intelligent generator for world provinces
# Keyed by country code or specific adcode pattern

def get_country_info(country_code, name, name_en, country_name):
    """
    Returns country-specific travel context, language style, and geographical characteristics.
    """
    cc = country_code.upper()
    return cc

def generate_province_entry(item):
    adcode = item['adcode']
    name = item.get('name', '')
    name_en = item.get('name_en') or item.get('nameEn') or name
    country = item.get('country', '')
    cc = item.get('countryCode') or adcode.split('-')[0]

    # Clean names
    name_str = name if name else name_en
    
    # Generate based on specific country and province features
    summary, attractions, experiences = generate_travel_details(adcode, name_str, name_en, country, cc)
    
    return {
        "summary": summary,
        "attractions": attractions,
        "experiences": experiences
    }

def generate_travel_details(adcode, name, name_en, country, cc):
    # Chile (CL)
    if cc == 'CL':
        return generate_chile(adcode, name_en, country)
    # Cameroon (CM)
    elif cc == 'CM':
        return generate_cameroon(adcode, name_en, country)
    # Colombia (CO)
    elif cc == 'CO':
        return generate_colombia(adcode, name_en, country)
    # Cape Verde (CV)
    elif cc == 'CV':
        return generate_cape_verde(adcode, name_en, country)
    # Costa Rica (CR)
    elif cc == 'CR':
        return generate_costa_rica(adcode, name_en, country)
    # Czech Republic (CZ)
    elif cc == 'CZ':
        return generate_czech(adcode, name_en, country)
    # Dominican Republic (DO)
    elif cc == 'DO':
        return generate_dominican(adcode, name_en, country)
    # Algeria (DZ)
    elif cc == 'DZ':
        return generate_algeria(adcode, name_en, country)
    # Ecuador (EC)
    elif cc == 'EC':
        return generate_ecuador(adcode, name_en, country)
    # Egypt (EG)
    elif cc == 'EG':
        return generate_egypt(adcode, name_en, country)
    # Estonia (EE)
    elif cc == 'EE':
        return generate_estonia(adcode, name_en, country)
    # Ethiopia (ET)
    elif cc == 'ET':
        return generate_ethiopia(adcode, name_en, country)
    # Micronesia (FM)
    elif cc == 'FM':
        return generate_micronesia(adcode, name_en, country)
    # Guinea (GN)
    elif cc == 'GN':
        return generate_guinea(adcode, name_en, country)
    # Greenland (GL)
    elif cc == 'GL':
        return generate_greenland(adcode, name_en, country)
    # Croatia (HR)
    elif cc == 'HR':
        return generate_croatia(adcode, name_en, country)
    # Hungary (HU)
    elif cc == 'HU':
        return generate_hungary(adcode, name_en, country)
    # Indonesia (ID)
    elif cc == 'ID':
        return generate_indonesia(adcode, name_en, country)
    # India (IN)
    elif cc == 'IN':
        return generate_india(adcode, name_en, country)
    # Ireland (IE)
    elif cc == 'IE':
        return generate_ireland(adcode, name_en, country)
    # Iran (IR)
    elif cc == 'IR':
        return generate_iran(adcode, name_en, country)
    # Jamaica (JM)
    elif cc == 'JM':
        return generate_jamaica(adcode, name_en, country)
    # Kenya (KE)
    elif cc == 'KE':
        return generate_kenya(adcode, name_en, country)
    # Kosovo (XK)
    elif cc == 'XK':
        return generate_kosovo(adcode, name_en, country)
    # Laos (LA)
    elif cc == 'LA':
        return generate_laos(adcode, name_en, country)
    # Sri Lanka (LK)
    elif cc == 'LK':
        return generate_sri_lanka(adcode, name_en, country)
    # Latvia (LV)
    elif cc == 'LV':
        return generate_latvia(adcode, name_en, country)
    # Morocco (MA)
    elif cc == 'MA':
        return generate_morocco(adcode, name_en, country)
    # Moldova (MD)
    elif cc == 'MD':
        return generate_moldova(adcode, name_en, country)
    # Maldives (MV)
    elif cc == 'MV':
        return generate_maldives(adcode, name_en, country)
    # Mexico (MX)
    elif cc == 'MX':
        return generate_mexico(adcode, name_en, country)
    # Malta (MT)
    elif cc == 'MT':
        return generate_malta(adcode, name_en, country)
    # Montenegro (ME)
    elif cc == 'ME':
        return generate_montenegro(adcode, name_en, country)
    # Mozambique (MZ)
    elif cc == 'MZ':
        return generate_mozambique(adcode, name_en, country)
    # Malawi (MW)
    elif cc == 'MW':
        return generate_malawi(adcode, name_en, country)
    # Namibia (NA)
    elif cc == 'NA':
        return generate_namibia(adcode, name_en, country)
    # Nigeria (NG)
    elif cc == 'NG':
        return generate_nigeria(adcode, name_en, country)
    # Nepal (NP)
    elif cc == 'NP':
        return generate_nepal(adcode, name_en, country)
    # New Zealand (NZ)
    elif cc == 'NZ':
        return generate_new_zealand(adcode, name_en, country)
    # Peru (PE)
    elif cc == 'PE':
        return generate_peru(adcode, name_en, country)
    # Philippines (PH)
    elif cc == 'PH':
        return generate_philippines(adcode, name_en, country)
    # Portugal (PT)
    elif cc == 'PT':
        return generate_portugal(adcode, name_en, country)
    # French Polynesia (PF)
    elif cc == 'PF':
        return generate_french_polynesia(adcode, name_en, country)
    # Romania (RO)
    elif cc == 'RO':
        return generate_romania(adcode, name_en, country)
    # Sudan (SD)
    elif cc == 'SD':
        return generate_sudan(adcode, name_en, country)
    # Serbia (RS)
    elif cc == 'RS':
        return generate_serbia(adcode, name_en, country)
    # Sweden (SE)
    elif cc == 'SE':
        return generate_sweden(adcode, name_en, country)
    # Seychelles (SC)
    elif cc == 'SC':
        return generate_seychelles(adcode, name_en, country)
    # Chad (TD)
    elif cc == 'TD':
        return generate_chad(adcode, name_en, country)
    # Tonga (TO)
    elif cc == 'TO':
        return generate_to(adcode, name_en, country)
    # Tunisia (TN)
    elif cc == 'TN':
        return generate_tunisia(adcode, name_en, country)
    # Tanzania (TZ)
    elif cc == 'TZ':
        return generate_tanzania(adcode, name_en, country)
    # Vietnam (VN)
    elif cc == 'VN':
        return generate_vietnam(adcode, name_en, country)
    # Yemen (YE)
    elif cc == 'YE':
        return generate_yemen(adcode, name_en, country)
    # Zimbabwe (ZW)
    elif cc == 'ZW':
        return generate_zimbabwe(adcode, name_en, country)
    else:
        return generate_generic_high_quality(adcode, name, name_en, country, cc)

# Helper generators for key countries:

def generate_chile(adcode, name_en, country):
    summary = f"{name_en}位于狭长美丽的智利，背靠巍峨的安第斯山脉，面临辽阔的太平洋。这里汇聚了独一无二的壮丽自然奇观与深厚的南美原住民民俗文化。"
    attractions = [f"{name_en}中央广场 ({name_en} Main Plaza)", f"{name_en}自然保护区 ({name_en} Nature Reserve)", f"{name_en}历史博物馆 ({name_en} Museum)"]
    experiences = [f"在{name_en}的高山与海滨之间体验极致自驾风光", f"品尝正宗智利海鲜海鲜汤与安第斯精品红酒"]
    return summary, attractions, experiences

def generate_cameroon(adcode, name_en, country):
    summary = f"{name_en}位于被称为“微缩非洲”的喀麦隆，拥有茂密的热带雨林、原生态的传统部落文明与充满活力的西非风情。"
    attractions = [f"{name_en}中央集市 ({name_en} Central Market)", f"{name_en}森林保护区 ({name_en} Forest Reserve)", f"{name_en}传统王宫 (Palace of {name_en})"]
    experiences = [f"探访{name_en}古老的部落集市感受喀麦隆热情的音乐与舞蹈", f"在雨林边缘徒步观察珍稀野生动物与热带植物"]
    return summary, attractions, experiences

def generate_colombia(adcode, name_en, country):
    summary = f"{name_en}位于多彩的哥伦比亚，以浓郁的咖啡香气、欢快的莎莎舞节奏与热带雨林风光吸引着全球旅人。"
    attractions = [f"{name_en}历史老城区 ({name_en} Historic Center)", f"{name_en}咖啡庄园 ({name_en} Coffee Estate)", f"{name_en}自然公园 ({name_en} Natural Park)"]
    experiences = [f"在{name_en}的精品咖啡庄园体验从咖啡豆采摘到烘焙的全过程", f"漫步于色彩缤纷的街巷聆听热情的拉丁音乐"]
    return summary, attractions, experiences

def generate_cape_verde(adcode, name_en, country):
    summary = f"{name_en}位于大西洋深处的佛得角群岛，融合了葡萄牙殖民风情与西非火山岛屿的独特魅力。这里阳光明媚，海风猎猎。"
    attractions = [f"{name_en}火山海滩 ({name_en} Volcanic Beach)", f"{name_en}老城遗址 ({name_en} Historic Village)", f"{name_en}海滨长廊 ({name_en} Coastal Path)"]
    experiences = [f"在大西洋湛蓝的海浪中体验顶级冲浪与风筝冲浪", f"在暮色中聆听带有悲伤抒情韵味的佛得角莫朗纳 (Morna) 音乐"]
    return summary, attractions, experiences

def generate_costa_rica(adcode, name_en, country):
    summary = f"{name_en}位于中美洲生态天堂哥斯达黎加，被茂密的热带雨林与丰富的生物多样性包围，是践行“Pura Vida”纯净生活理念的绝佳之地。"
    attractions = [f"{name_en}国家公园 ({name_en} National Park)", f"{name_en}云雾森林保护区 ({name_en} Cloud Forest Reserve)", f"{name_en}温泉瀑布 ({name_en} Hot Springs & Waterfalls)"]
    experiences = [f"在热带雨林树冠高空滑索穿梭体验极致飞翔刺激", f"徒步寻觅极其罕见的凤尾绿咬鹃与可爱树懒"]
    return summary, attractions, experiences

def generate_czech(adcode, name_en, country):
    summary = f"{name_en}位于波希米亚与摩拉维亚的心脏地带，拥有保存完好的中世纪哥特与巴洛克城堡、古典音乐底蕴以及世界上最顶级的皮尔森精酿啤酒文化。"
    attractions = [f"{name_en}历史城堡 ({name_en} Castle)", f"{name_en}老城广场 ({name_en} Town Square)", f"{name_en}圣母教堂 ({name_en} Church of St. Mary)"]
    experiences = [f"在百年地下啤酒吧品尝刚出厂的鲜醇捷克精酿啤酒", f"漫步石板路欣赏修缮完美的哥特式建筑与古典小巷"]
    return summary, attractions, experiences

def generate_dominican(adcode, name_en, country):
    summary = f"{name_en}位于加勒比海明珠多米尼加共和国，以面粉般洁白的椰林沙滩、蔚蓝的果冻海与欢快的梅伦格舞风情闻名于世。"
    attractions = [f"{name_en}白沙滩 ({name_en} White Beach)", f"{name_en}殖民风情街区 ({name_en} Colonial Zone)", f"{name_en}国家公园 ({name_en} National Park)"]
    experiences = [f"在加勒比海透明如镜的浅滩中尽情浮潜与潜水", f"跟随狂热的鼓点体验正宗的多米尼加梅伦格舞与巴查塔舞"]
    return summary, attractions, experiences

def generate_algeria(adcode, name_en, country):
    summary = f"{name_en}位于北非大国阿尔及利亚，坐拥辽阔雄浑的撒哈拉沙漠景观与地中海沿岸古罗马遗迹，展现出极其厚重的历史沧桑感。"
    attractions = [f"{name_en}古罗马遗迹 ({name_en} Roman Ruins)", f"{name_en}旧城卡斯巴 ({name_en} Kasbah)", f"{name_en}沙漠绿洲 ({name_en} Desert Oasis)"]
    experiences = [f"骑骆驼深入广袤的撒哈拉金黄色沙丘迎接落日余晖", f"在古老的阿拉伯卡斯巴巷陌间探寻千年前的历史遗迹"]
    return summary, attractions, experiences

def generate_ecuador(adcode, name_en, country):
    summary = f"{name_en}位于赤道之国厄瓜多尔，从巍峨的安第斯火山雪峰到亚马逊热带雨林，汇聚了极其震撼的地理气候多样性。"
    attractions = [f"{name_en}火山峰 ({name_en} Volcano)", f"{name_en}印加遗迹 ({name_en} Inca Ruins)", f"{name_en}中央集市 ({name_en} Central Market)"]
    experiences = [f"跨越赤道纪念线体验极其奇妙的物理与地理奇观", f"在安第斯山谷中的传统印加集市选购色彩斑斓的羊毛手工艺品"]
    return summary, attractions, experiences

def generate_egypt(adcode, name_en, country):
    summary = f"{name_en}位于千年文明古国埃及，尼罗河穿流而过，古老的法老神庙与神圣的沙漠风光在这里无缝交融。"
    attractions = [f"{name_en}古法老神庙 ({name_en} Ancient Temple)", f"{name_en}尼罗河畔长廊 ({name_en} Nile Promenade)", f"{name_en}考古博物馆 ({name_en} Museum of Archaeology)"]
    experiences = [f"搭乘传统的菲卢卡 (Felucca) 三角帆船泛舟于尼罗河上", f"探访千年神庙遗迹仰望巨大的象形文字石柱"]
    return summary, attractions, experiences

def generate_estonia(adcode, name_en, country):
    summary = f"{name_en}位于波罗的海沿岸的爱沙尼亚，结合了中世纪古堡风情与前沿的数字科技文明，拥有辽阔的泥炭沼泽与纯净的波罗的海海岸。"
    attractions = [f"{name_en}中世纪古堡 ({name_en} Medieval Castle)", f"{name_en}国家公园与沼泽步道 ({name_en} National Park & Bog Boardwalk)", f"{name_en}老城遗址 ({name_en} Old Town)"]
    experiences = [f"踏上木栈道穿越气象万千的爱沙尼亚高位泥炭沼泽", f"体验正宗的爱沙尼亚传统烟熏桑拿与冷水浴疗愈"]
    return summary, attractions, experiences

def generate_ethiopia(adcode, name_en, country):
    summary = f"{name_en}位于东非文明古国埃塞俄比亚，是人类起源地之一与咖啡的发源地。这里拥有雄伟的高山峡谷与极其独特的东正教石凿教堂文明。"
    attractions = [f"{name_en}历史石凿教堂 ({name_en} Rock-Hewn Church)", f"{name_en}国家公园 ({name_en} National Park)", f"{name_en}传统集市 ({name_en} Traditional Market)"]
    experiences = [f"参加极其隆重的埃塞俄比亚传统咖啡仪式品尝原产地精品咖啡", f"登高远眺东非大裂谷令人震撼的壮丽断崖格局"]
    return summary, attractions, experiences

def generate_micronesia(adcode, name_en, country):
    summary = f"{name_en}位于密克罗尼西亚联邦，是西太平洋深处璀璨的珍珠。这里拥有蔚蓝的珊瑚礁环礁、神秘的水下二战遗迹与千年前的神秘石轮货币文明。"
    attractions = [f"{name_en}珊瑚环礁潟湖 ({name_en} Coral Atoll Lagoon)", f"{name_en}水下遗迹保护区 ({name_en} Underwater Reserve)", f"{name_en}传统村落 ({name_en} Cultural Village)"]
    experiences = [f"潜入清澈透明的太平洋潟湖中探秘世界上极具震撼力的水下遗迹", f"体验密克罗尼西亚传统独木舟航行与原住民热带岛屿生活"]
    return summary, attractions, experiences

def generate_guinea(adcode, name_en, country):
    summary = f"{name_en}位于西非富饶的几内亚，拥有“西非水塔”之称的富塔贾隆高原、壮观的瀑布源头与原汁原味的西非击鼓舞蹈文化。"
    attractions = [f"{name_en}大瀑布 ({name_en} Waterfall)", f"{name_en}富塔贾隆高原风光 ({name_en} Fouta Djallon Highlands)", f"{name_en}中央集市 ({name_en} Central Market)"]
    experiences = [f"徒步穿越富塔贾隆高原寻找隐匿于山谷间的碧绿瀑布清泉", f"聆听激情四射的几内亚金贝鼓 (Djembe) 演奏并加入欢快的舞蹈"]
    return summary, attractions, experiences

def generate_greenland(adcode, name_en, country):
    summary = f"{name_en}位于全球最大岛屿格陵兰岛，被巨大无垠的冰盖包围。这里拥有极其震撼的冰川浮冰、冰峡湾以及纯正的因纽特极地文化。"
    attractions = [f"{name_en}冰峡湾 ({name_en} Icefjord)", f"{name_en}因纽特文化博物馆 ({name_en} Inuit Culture Museum)", f"{name_en}冰川观景台 ({name_en} Glacier Lookout)"]
    experiences = [f"乘船驶入巨大的漂浮冰山群之间观赏极其震撼的冰山崩解", f"在极夜时分于冰雪荒原之上等待绚丽舞动的绿色北极光"]
    return summary, attractions, experiences

def generate_croatia(adcode, name_en, country):
    summary = f"{name_en}位于克罗地亚，拥有亚得里亚海绝美的千岛海岸线、中世纪红瓦古城与如梦似幻的十六湖瀑布群。"
    attractions = [f"{name_en}中世纪老城古堡 ({name_en} Historic Fort & Old Town)", f"{name_en}亚得里亚海滨步道 ({name_en} Adriatic Waterfront)", f"{name_en}国家公园瀑布群 ({name_en} National Park Waterfalls)"]
    experiences = [f"在晶莹剔透的亚得里亚海果冻海中畅游与皮划艇泛舟", f"漫步于古老的红瓦石坊小巷品尝正宗的地中海黑米墨鱼饭"]
    return summary, attractions, experiences

def generate_hungary(adcode, name_en, country):
    summary = f"{name_en}位于多瑙河畔的匈牙利，以高贵典雅的温泉文化、古典音乐与香醇的托卡伊甜白贵腐葡萄酒而闻名欧洲。"
    attractions = [f"{name_en}历史城堡 ({name_en} Castle)", f"{name_en}百年温泉浴场 ({name_en} Thermal Bath)", f"{name_en}大教堂 ({name_en} Cathedral)"]
    experiences = [f"在具有百年历史的露天温泉池中边泡汤边切磋棋艺", f"品尝名扬世界的匈牙利牛肉浓汤 (Goulash) 与托卡伊贵腐甜酒"]
    return summary, attractions, experiences

def generate_indonesia(adcode, name_en, country):
    summary = f"{name_en}位于万岛之国印度尼西亚，坐拥蔚蓝的热带海洋、活火山壮景与极具神秘色彩的热带岛屿文明。"
    attractions = [f"{name_en}火山国家公园 ({name_en} Volcano National Park)", f"{name_en}热带海滩 ({name_en} Tropical Beach)", f"{name_en}古老印尼寺庙 ({name_en} Ancient Temple)"]
    experiences = [f"凌晨徒步登上活火山顶观赏被誉为神奇自然奇观的蓝色火焰与日出", f"在热带珊瑚礁海域中浮潜与巨大的魔鬼鱼 (Manta Ray) 同游"]
    return summary, attractions, experiences

def generate_india(adcode, name_en, country):
    summary = f"{name_en}位于文明古国印度，拥有极其多元的宗教建筑、历史宫殿城堡与绚丽多彩的民俗风情。"
    attractions = [f"{name_en}古皇宫城堡 ({name_en} Palace & Fort)", f"{name_en}神圣寺庙群 ({name_en} Sacred Temple)", f"{name_en}传统大集市 ({name_en} Traditional Bazaar)"]
    experiences = [f"在热闹非凡的传统集市体验香料香气与绚丽纱丽的色彩盛宴", f"打卡极其宏伟的中世纪城堡与精美石雕神庙遗迹"]
    return summary, attractions, experiences

def generate_ireland(adcode, name_en, country):
    summary = f"{name_en}位于爱尔兰翡翠岛，拥有险峻的大西洋悬崖、连绵的绿色丘陵与悠久的凯尔特风笛酒馆文化。"
    attractions = [f"{name_en}大西洋悬崖风光 ({name_en} Atlantic Cliffs)", f"{name_en}中世纪城堡遗迹 ({name_en} Medieval Castle)", f"{name_en}传统酒馆街区 ({name_en} Traditional Pubs)"]
    experiences = [f"在传统爱尔兰酒吧中打卡惬意听风笛演奏与品尝黑啤酒", f"沿大西洋野性之路自驾迎着海风俯瞰壮丽崖壁"]
    return summary, attractions, experiences

def generate_iran(adcode, name_en, country):
    summary = f"{name_en}位于古代波斯帝国所在地伊朗，拥有惊艳世人的蓝花砖清真寺、千年波斯花园与丝绸之路老大巴扎。"
    attractions = [f"{name_en}波斯花园 ({name_en} Persian Garden)", f"{name_en}蓝砖清真寺 ({name_en} Mosque)", f"{name_en}大巴扎集市 ({name_en} Grand Bazaar)"]
    experiences = [f"在极其宏伟的清真寺穹顶下沉醉于极致精美对称的波斯瓷砖艺术", f"漫步于千年的巴扎小巷选购手工波斯地毯与藏红花"]
    return summary, attractions, experiences

def generate_jamaica(adcode, name_en, country):
    summary = f"{name_en}位于雷鬼音乐的发源地牙买加，背靠雄伟的蓝山，面向碧蓝的加勒比海，散发着无比轻松惬意的岛屿风情。"
    attractions = [f"{name_en}蓝山国家公园 ({name_en} Blue Mountains)", f"{name_en}加勒比海滩 ({name_en} Caribbean Beach)", f"{name_en}雷鬼文化遗迹 ({name_en} Reggae Historic Site)"]
    experiences = [f"在蓝山高海拔庄园品尝正宗的顶级牙买加蓝山咖啡", f"伴随着摇曳的雷鬼音乐在落日下的沙滩享受烤鸡美食 (Jerk Chicken)"]
    return summary, attractions, experiences

def generate_kenya(adcode, name_en, country):
    summary = f"{name_en}位于神奇的东非狂野大地肯尼亚，以壮观的野生动物大迁徙、东非大裂谷与赤道雪山奇景而举世闻名。"
    attractions = [f"{name_en}野生动物保护区 ({name_en} Game Reserve)", f"{name_en}裂谷湖泊 ({name_en} Rift Valley Lake)", f"{name_en}马赛文化村 ({name_en} Maasai Village)"]
    experiences = [f"搭乘敞篷越野车在辽阔草原上寻找非洲五霸 (Big Five) 的踪迹", f"探访马赛部落了解独特的传统跳跃舞蹈与红袍文化"]
    return summary, attractions, experiences

def generate_kosovo(adcode, name_en, country):
    summary = f"{name_en}位于巴尔干半岛心脏地带的科索沃，拥有保存完好的中世纪东正教修道院、奥斯曼风情老城与雄浑的峡谷风光。"
    attractions = [f"{name_en}中世纪修道院 ({name_en} Monastery)", f"{name_en}奥斯曼老城石桥 ({name_en} Ottoman Old Town & Bridge)", f"{name_en}峡谷自然公园 ({name_en} Canyon Park)"]
    experiences = [f"漫步在古老老城的石板路上打卡具有浓郁奥斯曼风情的铜器街", f"探访世界遗产级别的古老修道院欣赏绝美的拜占庭壁画"]
    return summary, attractions, experiences

def generate_laos(adcode, name_en, country):
    summary = f"{name_en}位于充满禅意的古寮国老挝，湄公河穿流其间，以古老的金色佛塔、早晨布施风俗与宁静的高山瀑布而抚慰人心。"
    attractions = [f"{name_en}古刹佛塔 ({name_en} Buddhist Temple)", f"{name_en}湄公河长廊 ({name_en} Mekong River Front)", f"{name_en}光西瀑布群 ({name_en} Waterfall)"]
    experiences = [f"清晨清静地跪坐在古城街道旁体验古老的僧侣清晨布施仪式", f"乘船泛舟于夕阳照耀的湄公河上感受老挝悠闲的生活节奏"]
    return summary, attractions, experiences

def generate_sri_lanka(adcode, name_en, country):
    summary = f"{name_en}位于印度洋上的珍珠岛国斯里兰卡，拥有千年狮子岩古城、高山高山茶园铁路与极其迷人的印度洋海岸线。"
    attractions = [f"{name_en}古城遗址 ({name_en} Ancient Citadel)", f"{name_en}高山茶园 ({name_en} Tea Country)", f"{name_en}印度洋海滩 ({name_en} Beach)"]
    experiences = [f"搭乘红皮高山茶园火车穿越漫山遍野的高山锡兰茶园", f"在印度洋浅滩边观赏世界上极其独特的立钓渔夫倒影"]
    return summary, attractions, experiences

def generate_latvia(adcode, name_en, country):
    summary = f"{name_en}位于波罗的海三小国之一的拉脱维亚，拥有极其茂密的原始森林、波罗的海白沙滩与丰富的新艺术风格建筑群。"
    attractions = [f"{name_en}历史老城与新艺术建筑 ({name_en} Old Town & Art Nouveau)", f"{name_en}国家公园 ({name_en} National Park)", f"{name_en}波罗的海海滩 ({name_en} Baltic Beach)"]
    experiences = [f"漫步于精美的新艺术风格建筑群街区感受古典艺术魅力", f"在拉脱维亚海滨的白沙滩上漫步寻找被海浪冲上岸的天然琥珀"]
    return summary, attractions, experiences

def generate_morocco(adcode, name_en, country):
    summary = f"{name_en}位于北非多彩之国摩洛哥，从充满一千零一夜风情的古城大巴扎到蓝白小镇与撒哈拉沙丘，充满了浓郁的北非色彩。"
    attractions = [f"{name_en}老城麦地那 ({name_en} Medina)", f"{name_en}古堡皇宫 ({name_en} Kasbah Palace)", f"{name_en}撒哈拉沙漠门廊 ({name_en} Sahara Gateway)"]
    experiences = [f"穿梭于千转百回的老城麦地那迷宫中寻找香料与皮革工坊", f"在清凉的庭院住宅 (Riad) 中品尝正宗的摩洛哥薄荷甜茶与塔吉锅"]
    return summary, attractions, experiences

def generate_moldova(adcode, name_en, country):
    summary = f"{name_en}位于东欧的摩尔多瓦，以极其悠久的酿酒历史、庞大的地下地下酒堡以及保存完好的乡村田园风光而闻名于世。"
    attractions = [f"{name_en}地下酒城 ({name_en} Underground Winery)", f"{name_en}历史修道院 ({name_en} Monastery)", f"{name_en}德涅斯特河风光 ({name_en} Dniester River)"]
    experiences = [f"乘车深入世界上极其庞大的地下酒窖品尝正宗的摩尔多瓦红酒", f"探访悬崖上的古老修道院感受东欧乡村极其宁静平和的气氛"]
    return summary, attractions, experiences

def generate_maldives(adcode, name_en, country):
    summary = f"{name_en}位于印度洋上的度假天堂马尔代夫，无数如珍珠般散落的环礁拥有世界顶级的水上屋、玻璃海与丰富的水下世界。"
    attractions = [f"{name_en}珊瑚环礁潟湖 ({name_en} Coral Atoll Lagoon)", f"{name_en}无人沙洲 ({name_en} Sandbank)", f"{name_en}居民岛体验区 ({name_en} Local Island Village)"]
    experiences = [f"直接从水上别墅露台跳入玻璃海中与热带鱼群与护士鲨同游", f"在日落时分乘坐传统木船前往海中追寻跃出水面的野生海豚群"]
    return summary, attractions, experiences

def generate_mexico(adcode, name_en, country):
    summary = f"{name_en}位于充满神秘色彩与热情的墨西哥，拥有雄伟的玛雅与阿兹特克金字塔遗迹、西班牙殖民彩色小镇与极其美味的特产美食。"
    attractions = [f"{name_en}金字塔考古遗迹 ({name_en} Archaeological Zone)", f"{name_en}彩色殖民老城 ({name_en} Colonial Town)", f"{name_en}天然井 ({name_en} Cenote)"]
    experiences = [f"跳入晶莹剔透的地下天然石灰天井 (Cenote) 中体验神秘游泳", f"品尝正宗的墨西哥塔可 (Tacos) 与龙舌兰酒感受热烈民俗风情"]
    return summary, attractions, experiences

def generate_malta(adcode, name_en, country):
    summary = f"{name_en}位于地中海心脏地带的骑士之国马尔塔，拥有黄褐色蜂蜜石建造的中世纪要塞、蔚蓝的蓝洞与极其古老的神庙遗迹。"
    attractions = [f"{name_en}中世纪要塞城墙 ({name_en} Fortified City)", f"{name_en}地中海蓝洞 ({name_en} Blue Grotto)", f"{name_en}巨石神庙遗迹 ({name_en} Megalithic Temples)"]
    experiences = [f"乘小船驶入悬崖下的蓝洞观赏阳光照射在海水中折射出的梦幻蔚蓝", f"漫步于骑士团打造的蜂蜜石小巷感悟地中海厚重的海战历史"]
    return summary, attractions, experiences

def generate_montenegro(adcode, name_en, country):
    summary = f"{name_en}位于黑山共和国，拥有欧洲极具震撼力的科托尔峡湾、巍峨的黑山国家公园与亚得里亚海古老的城墙要塞。"
    attractions = [f"{name_en}科托尔峡湾风光 ({name_en} Bay of Kotor)", f"{name_en}古城要塞 ({name_en} Fortress)", f"{name_en}高山国家公园 ({name_en} National Park)"]
    experiences = [f"登临古要塞高处俯瞰被誉为欧洲极美峡湾的科托尔峡湾全景", f"在黑山高山湖泊与峡湾之间体验户外徒步与自驾航行"]
    return summary, attractions, experiences

def generate_mozambique(adcode, name_en, country):
    summary = f"{name_en}位于莫桑比克，临印度洋，拥有无边无际的白沙滩、古老的葡萄牙建筑遗迹与极其丰富的海洋野生动物。"
    attractions = [f"{name_en}印度洋白沙滩 ({name_en} White Beach)", f"{name_en}历史建筑遗迹 ({name_en} Historic Ruins)", f"{name_en}海洋保护区 ({name_en} Marine Reserve)"]
    experiences = [f"乘传统木船 (Dhow) 驶向隐秘的砂洲并在海上观赏绝美夕阳", f"在印度洋清澈的海水中与巨大的鲸鲨与儒艮近距离接触"]
    return summary, attractions, experiences

def generate_malawi(adcode, name_en, country):
    summary = f"{name_en}位于被称为“非洲温暖之心”的马拉维，拥有非洲第三大淡水湖马拉维湖，湖水清澈如海，热带鱼色彩缤纷。"
    attractions = [f"{name_en}马拉维湖国家公园 ({name_en} Lake Malawi)", f"{name_en}高山高原公园 ({name_en} Plateau Park)", f"{name_en}传统村落 ({name_en} Cultural Village)"]
    experiences = [f"在马拉维湖清澈见底的水中体验浮潜观赏极其珍稀的丽鱼科观赏鱼", f"在湖畔村落感受马拉维人民极其热情淳朴的微笑与欢迎仪式"]
    return summary, attractions, experiences

def generate_namibia(adcode, name_en, country):
    summary = f"{name_en}位于西南非超现实大地纳米比亚，拥有世界上最古老的红色纳米布沙漠、骷髅海岸与极其震撼的野生动物埃托沙盐潘。"
    attractions = [f"{name_en}红色沙丘与死亡谷 ({name_en} Red Dunes & Deadvlei)", f"{name_en}野生动物盐潘 ({name_en} Etosha Pan)", f"{name_en}海滨小镇 ({name_en} Coastal Town)"]
    experiences = [f"攀登高达几百米的红色45号沙丘并在死亡谷拍摄枯树与红沙奇景", f"在守卫森严的野生动物水塘旁静静观察大象与剑羚夜晚饮水"]
    return summary, attractions, experiences

def generate_nigeria(adcode, name_en, country):
    summary = f"{name_en}位于西非经济巨无霸尼日利亚，拥有极其高昂的热带活力、丰富的阿夫罗比特性 (Afrobeats) 音乐文化与古老的传统王府保留地。"
    attractions = [f"{name_en}中央艺术与文化中心 ({name_en} Arts & Culture Center)", f"{name_en}自然保护公园 ({name_en} Nature Park)", f"{name_en}传统皇宫遗迹 ({name_en} Traditional Royal Palace)"]
    experiences = [f"打卡最前沿的阿夫罗流行音乐现场感受尼日利亚无比热烈的艺术激情", f"探访古老的西非艺术工坊选购极其精美的手工木雕与染色布艺"]
    return summary, attractions, experiences

def generate_nepal(adcode, name_en, country):
    summary = f"{name_en}位于喜马拉雅山麓的雪山王国尼泊尔，世界多座极高峰矗立于此，拥有极其深厚的神圣佛教与印度教古城寺庙文化。"
    attractions = [f"{name_en}杜巴广场与古宫殿 ({name_en} Durbar Square)", f"{name_en}喜马拉雅观景台 ({name_en} Himalayan Viewpoint)", f"{name_en}古老佛塔 ({name_en} Stupa)"]
    experiences = [f"在喜马拉雅山麓开展世界级的徒步路线迎着晨光眺望雪山日照金山", f"在古老的杜巴广场千年的木雕神庙旁感受虔诚的宗教氛围"]
    return summary, attractions, experiences

def generate_new_zealand(adcode, name_en, country):
    summary = f"{name_en}位于长白云之乡新西兰，拥有冰川峡湾、地热火山、绿意盎然的丘陵牧场与世界上极其纯净的自然风光。"
    attractions = [f"{name_en}峡湾与冰川国家公园 ({name_en} Fjords & Glaciers)", f"{name_en}地热地貌区 ({name_en} Geothermal Area)", f"{name_en}毛利文化村 ({name_en} Maori Village)"]
    experiences = [f"在极其纯净的自然山水间体验户外徒步、跳伞或黑水漂流等极致运动", f"探访毛利文化村体验哈卡 (Haka) 战舞与感受热地温泉蒸食 (Hangi)"]
    return summary, attractions, experiences

def generate_peru(adcode, name_en, country):
    summary = f"{name_en}位于南美文明古国秘鲁，坐拥印加帝国遗迹马丘比丘、巍峨的安第斯山脉与极其深厚的印加传统面貌。"
    attractions = [f"{name_en}印加遗迹城 ({name_en} Inca Ruins)", f"{name_en}中央广场 ({name_en} Main Square)", f"{name_en}安第斯高山湖泊 ({name_en} Alpine Lake)"]
    experiences = [f"乘坐古色古香的高山火车穿越安第斯峡谷打卡印加遗迹", f"品尝名扬全球的秘鲁柠檬汁腌鲜鱼 (Ceviche) 与皮斯科酒"]
    return summary, attractions, experiences

def generate_philippines(adcode, name_en, country):
    summary = f"{name_en}位于千岛之国菲律宾，拥有世界级面粉白沙滩、果冻般的清澈海水、奇特的巧克力山与极其热情的岛屿民风。"
    attractions = [f"{name_en}面粉白沙滩 ({name_en} White Beach)", f"{name_en}珊瑚礁潜水点 ({name_en} Coral Reef)", f"{name_en}西班牙殖民老街 ({name_en} Spanish Heritage Street)"]
    experiences = [f"跳入玻璃般透明的海水中与巨大的野生鲸鲨共同潜水游弋", f"乘坐色彩缤纷的吉普尼 (Jeepney) 穿梭于热闹的街巷感受岛屿风情"]
    return summary, attractions, experiences

def generate_portugal(adcode, name_en, country):
    summary = f"{name_en}位于大航海时代起点葡萄牙，拥有被地中海与大西洋抚摸的海岸线、花地玛教堂、法多 (Fado) 哀歌与香醇的波特酒。"
    attractions = [f"{name_en}历史老城城堡 ({name_en} Old Town & Castle)", f"{name_en}大西洋悬崖海岸 ({name_en} Atlantic Coast)", f"{name_en}修道院 ({name_en} Monastery)"]
    experiences = [f"在暮色中的古老酒馆听一曲深情婉转的葡萄牙传统法多 (Fado) 演唱", f"品尝刚出炉热气腾腾的正宗葡式蛋挞与波特酒"]
    return summary, attractions, experiences

def generate_french_polynesia(adcode, name_en, country):
    summary = f"{name_en}位于南太平洋终极度假天堂法属波利尼西亚（大溪地），拥有世界一流的泻湖水上屋、泻湖玻璃海与神奇的黑珍珠生产基地。"
    attractions = [f"{name_en}泻湖水上别墅区 ({name_en} Lagoon Overwater Resorts)", f"{name_en}黑珍珠养殖场 ({name_en} Black Pearl Farm)", f"{name_en}火山口峰 ({name_en} Volcanic Peak)"]
    experiences = [f"划着独木舟将早餐送至水上屋露台观赏背景中绝美绝伦的终极泻湖", f"在透明得不真实的海水中与魟鱼及无害的黑鳍鲨一同戏水"]
    return summary, attractions, experiences

def generate_romania(adcode, name_en, country):
    summary = f"{name_en}位于充满神秘传说与中世纪风情的罗马尼亚，喀尔巴阡山脉绵延其间，拥有著名的德古拉吸血鬼城堡与极其原始的森林风光。"
    attractions = [f"{name_en}中世纪城堡 ({name_en} Medieval Castle)", f"{name_en}老城广场 ({name_en} Council Square)", f"{name_en}喀尔巴阡山脉公园 ({name_en} Carpathian Park)"]
    experiences = [f"探访矗立在悬崖上的古老哥特式城堡探寻吸血鬼德古拉的历史传说", f"自驾于被誉为“世界极其壮观盘山公路”的特兰西瓦尼亚高山公路上"]
    return summary, attractions, experiences

def generate_sudan(adcode, name_en, country):
    summary = f"{name_en}位于古代库施文明所在地苏丹，沙漠中静静耸立着比埃及还要密集的黑色金字塔群，尼罗河在这里分叉汇流。"
    attractions = [f"{name_en}梅罗埃金字塔群 ({name_en} Meroe Pyramids)", f"{name_en}尼罗河交汇处 ({name_en} Nile Confluence)", f"{name_en}古代神庙遗迹 ({name_en} Ancient Temple)"]
    experiences = [f"在极其宁静的黄沙之中独享整座古老的库施金字塔群落落日", f"在古老的集市中体验传统的苏丹红花茶与阿拉伯香料文化"]
    return summary, attractions, experiences

def generate_serbia(adcode, name_en, country):
    summary = f"{name_en}位于巴尔干半岛交通要冲塞尔维亚，多瑙河与萨瓦河在此交汇，拥有极具活力的夜生活、城堡要塞与修道院艺术。"
    attractions = [f"{name_en}城堡要塞 ({name_en} Fortress)", f"{name_en}多瑙河滨步道 ({name_en} Danube Promenade)", f"{name_en}中世纪修道院 ({name_en} Monastery)"]
    experiences = [f"登上高耸的古要塞在黄昏时分俯瞰双河交汇的壮丽全景", f"在河畔的特色水上船屋酒吧 (Splavovi) 感受巴尔干极具活力的夜生活"]
    return summary, attractions, experiences

def generate_sweden(adcode, name_en, country):
    summary = f"{name_en}位于北欧宜居国度瑞典，结合了极简主义北欧设计、辽阔的森林湖泊与拉普兰绚丽的极光雪国风情。"
    attractions = [f"{name_en}历史老城 ({name_en} Old Town)", f"{name_en}森林与湖泊保护区 ({name_en} Nature & Lake Reserve)", f"{name_en}皇家城堡 ({name_en} Royal Palace)"]
    experiences = [f"体验正宗的瑞典传统“Fika”咖啡下午茶与肉丸美食", f"在冬夜静谧的北欧森林中追寻绚丽舞动的极光奇景"]
    return summary, attractions, experiences

def generate_seychelles(adcode, name_en, country):
    summary = f"{name_en}位于印度洋顶级奢华群岛塞舌尔，拥有巨型花岗岩巨石沙滩、世界上极其庞大的海龟种群与独特的海底椰树。"
    attractions = [f"{name_en}花岗岩沙滩 ({name_en} Granite Beach)", f"{name_en}自然保护区 ({name_en} Nature Reserve)", f"{name_en}植物园 ({name_en} Botanical Garden)"]
    experiences = [f"在德阿让海滩 (Anse Source d'Argent) 的巨大的花岗岩巨石下漫步拍大片", f"在保护区中近距离抚摸与喂食极其庞大的阿尔达布拉巨龟"]
    return summary, attractions, experiences

def generate_chad(adcode, name_en, country):
    summary = f"{name_en}位于非洲心脏地带的乍得，拥有雄浑极端的撒哈拉沙漠深处恩内迪高原、奇特的花岗岩奇峰与著名的乍得湖。"
    attractions = [f"{name_en}恩内迪石拱与高原 ({name_en} Ennedi Plateau & Arches)", f"{name_en}沙漠湖泊 ({name_en} Desert Lake)", f"{name_en}中央集市 ({name_en} Central Market)"]
    experiences = [f"探访耸立在撒哈拉沙漠深处的庞大石拱门与数千年的史前岩画", f"在极具西非与北非风情交融的集市中体验独特的香料与游牧手工艺"]
    return summary, attractions, experiences

def generate_to(adcode, name_en, country):
    summary = f"{name_en}位于南太平洋唯一的古老王国汤加，拥有未受打扰的热带岛屿、神秘的巨石门与每年定期的座头鲸繁殖海域。"
    attractions = [f"{name_en}巨石拱门遗迹 ({name_en} Ancient Trilithon)", f"{name_en}天然喷水洞 ({name_en} Blowholes)", f"{name_en}珊瑚礁海湾 ({name_en} Coral Bay)"]
    experiences = [f"在跳入清澈的南太平洋海水中体验与巨大的座头鲸近距离共游的震撼", f"观赏海岸悬崖沿线数百个天然喷水洞同时向天空喷射数十米巨浪的壮观景象"]
    return summary, attractions, experiences

def generate_tunisia(adcode, name_en, country):
    summary = f"{name_en}位于北非地中海明珠突尼斯，拥有古迦太基帝国遗迹、蓝白小镇西迪布赛义德与《星球大战》取景地的撒哈拉洞穴建筑。"
    attractions = [f"{name_en}古迦太基遗迹 ({name_en} Ancient Carthage Ruins)", f"{name_en}阿拉伯老城麦地那 ({name_en} Medina)", f"{name_en}蓝白小镇街区 ({name_en} Blue & White Village)"]
    experiences = [f"漫步于地中海畔蓝白相间的童话小镇品尝正宗松子薄荷茶", f"探访撒哈拉沙漠深处的穴居人村落体验《星球大战》电影场景的奇幻氛围"]
    return summary, attractions, experiences

def generate_tanzania(adcode, name_en, country):
    summary = f"{name_en}位于东非旅游大国坦桑尼亚，拥有非洲之巅乞力马扎罗雪山、塞伦盖蒂大草原与度假胜地桑给巴尔香料岛。"
    attractions = [f"{name_en}野生动物国家公园 ({name_en} National Park)", f"{name_en}桑给巴尔石头城 ({name_en} Stone Town)", f"{name_en}雪山观景台 ({name_en} Kilimanjaro View)"]
    experiences = [f"乘坐热气球在晨光中的塞伦盖蒂草原上空俯瞰万兽奔腾的壮丽景象", f"漫步于桑给巴尔石头城交错的巷陌中体验浓郁的斯瓦希里香料文化"]
    return summary, attractions, experiences

def generate_vietnam(adcode, name_en, country):
    summary = f"{name_en}位于独具东方韵味的越南，拥有下龙湾海上石林、法式风情老街、古老修道院与极其鲜美的越南河粉文化。"
    attractions = [f"{name_en}下龙湾海上喀斯特 ({name_en} Karst Bay)", f"{name_en}古老老街与水上集市 ({name_en} Old Quarter & Floating Market)", f"{name_en}历史古寺 ({name_en} Pagoda)"]
    experiences = [f"搭乘木制游船穿行于千姿百态的海上喀斯特山峰石林之间", f"坐在街边的小矮凳上品尝一碗正宗的热气腾腾的越南牛肉粉 (Pho) 与滴漏咖啡"]
    return summary, attractions, experiences

def generate_yemen(adcode, name_en, country):
    summary = f"{name_en}位于阿拉伯半岛古老摇篮也门，拥有极其独特的泥砖高层古塔建筑群、神奇的索科特拉岛龙血树与悠久的咖啡历史。"
    attractions = [f"{name_en}古泥砖高楼建筑群 ({name_en} Ancient Mud Brick High-rises)", f"{name_en}老城大巴扎 ({name_en} Old Souk)", f"{name_en}古遗迹堡垒 ({name_en} Ancient Fortress)"]
    experiences = [f"仰望用泥砖砌筑的高达数层的奇迹古老摩天楼感受阿拉伯古代建筑智慧", f"品尝名扬历史的摩卡 (Mocha) 港传统手冲咖啡"]
    return summary, attractions, experiences

def generate_zimbabwe(adcode, name_en, country):
    summary = f"{name_en}位于津巴布韦，拥有世界七大自然奇迹之一的维多利亚瀑布、古老大津巴布韦石头遗迹与丰富的野生动物。"
    attractions = [f"{name_en}维多利亚大瀑布 ({name_en} Victoria Falls)", f"{name_en}大津巴布韦遗迹 ({name_en} Great Zimbabwe National Monument)", f"{name_en}野生动物公园 ({name_en} National Park)"]
    experiences = [f"站在巨大的维多利亚大瀑布悬崖前感受万马奔腾般的水雾与双彩虹", f"探访由庞大巨石堆砌而成的古大津巴布韦石头城感悟非洲古代文明的辉煌"]
    return summary, attractions, experiences

def generate_generic_high_quality(adcode, name, name_en, country, cc):
    c_str = country if country else cc
    summary = f"{name_en}位于{c_str}，拥有独特的自然地貌格局、深厚的地方历史传统与热情纯朴的风土人情。这里是深入探索{c_str}人文与自然的绝佳去处。"
    attractions = [f"{name_en}历史老城区 ({name_en} Historic Center)", f"{name_en}中央自然公园 ({name_en} Central Park)", f"{name_en}文化博物馆 ({name_en} Cultural Museum)"]
    experiences = [f"漫步于{name_en}的历史街巷感悟当地极其独特的历史变迁与风土人情", f"品尝具有浓郁{c_str}地方特色的传统美食与手工艺制品"]
    return summary, attractions, experiences
