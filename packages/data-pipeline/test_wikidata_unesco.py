import urllib.request
import urllib.parse
import json

sparql = """
SELECT ?site ?siteLabel ?countryLabel ?coord WHERE {
  ?site wdt:P1435 wd:Q9259 .
  OPTIONAL { ?site wdt:P17 ?country . }
  OPTIONAL { ?site wdt:P625 ?coord . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "zh,zh-hans,en". }
}
LIMIT 2000
"""

url = 'https://query.wikidata.org/sparql?format=json&query=' + urllib.parse.quote(sparql)
print('Querying Wikidata SPARQL for all UNESCO World Heritage Sites...')
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'VoyagerTravelApp/1.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        bindings = data['results']['bindings']
        print('SUCCESS! Total UNESCO World Heritage Sites fetched from Wikidata:', len(bindings))
        if len(bindings) > 0:
            print('Sample item:', json.dumps(bindings[0], ensure_ascii=False, indent=2))
except Exception as e:
    print('Failed:', e)
