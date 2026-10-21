import json,urllib.request
def get(u):
  out=[]
  while u:
    d=json.load(urllib.request.urlopen(u));out+=d['value'];u=d.get('odata.nextLink')
  return out
import urllib.parse
f="%24filter="+urllib.parse.quote("startswith(KEY,'GM')")+"&%24format=json"
b=get("https://opendata.cbs.nl/ODataApi/odata/86211NED/TypedDataSet?"+f.replace("KEY","AlleRegioIndelingen")+"&%24select=Codering_3,TotaalLand_5,TotaalNatuurlijkTerrein_38,Bos_39,StedelijkGroen_28,TotaalRecreatiefTerrein_27")
i=get("https://opendata.cbs.nl/ODataApi/odata/85984NED/TypedDataSet?"+f.replace("KEY","WijkenEnBuurten")+"&%24select=Codering_3,AantalInwoners_5,OppervlakteLand_116")
B={r['Codering_3'].strip():r for r in b};I={r['Codering_3'].strip():r for r in i}
from importlib import util
gems=json.loads(open('/dev-server/src/data/gemeentePaths.ts').read().split('GEMEENTEN: Gemeente[] = ')[1].rstrip().rstrip(';'))
out={};miss=[]
for g in gems:
  c=g['id'];r=B.get(c);ii=I.get(c)
  e={}
  if ii and ii['AantalInwoners_5']: e['inw']=ii['AantalInwoners_5']
  if ii and ii['OppervlakteLand_116']: e['ha']=ii['OppervlakteLand_116']
  if r and r['TotaalLand_5']:
    L=r['TotaalLand_5'];e['natuur']=round(100*(r['TotaalNatuurlijkTerrein_38'] or 0)/L,1);e['bos']=round(100*(r['Bos_39'] or 0)/L,1);e['groen']=round(100*((r['StedelijkGroen_28'] or 0)+(r['TotaalRecreatiefTerrein_27'] or 0))/L,1)
  elif g['naam']=='Voorne aan Zee':
    rs=[B[k] for k in ('GM0501','GM0530','GM0614') if k in B];L=sum(x['TotaalLand_5'] for x in rs)
    sm=lambda k:sum((x[k] or 0) for x in rs)
    e['natuur']=round(100*sm('TotaalNatuurlijkTerrein_38')/L,1);e['bos']=round(100*sm('Bos_39')/L,1);e['groen']=round(100*(sm('StedelijkGroen_28')+sm('TotaalRecreatiefTerrein_27'))/L,1)
  else: miss.append(g['naam'])
  out[c]=e
vals=sorted(e['natuur'] for e in out.values() if 'natuur' in e)
q=[vals[int(len(vals)*k/5)] for k in (1,2,3,4)]
for e in out.values():
  if 'natuur' in e: e['klasse']=1+sum(e['natuur']>=t for t in q)
open('/dev-server/src/data/gemeenteCijfers.ts','w').write("// Auto-gegenereerd uit CBS open data: Kerncijfers wijken en buurten 2024 (85984NED: inwoners, landoppervlakte) en Bodemgebruik wijk- en buurtcijfers 2022 (86211NED: bos, natuurlijk terrein, stedelijk groen en recreatieterrein, % van land).\n// klasse 1-5 = groen-indicatie: kwintiel van aandeel bos en natuur t.o.v. alle gemeenten.\nexport type GemeenteCijfers = { inw?: number; ha?: number; natuur?: number; bos?: number; groen?: number; klasse?: number };\nexport const GEMEENTE_CIJFERS_BRON = { inwoners: 2024, bodem: 2022 };\nexport const GEMEENTE_CIJFERS: Record<string, GemeenteCijfers> = "+json.dumps(out,separators=(',',':'))+";\n")
print(len(out),'miss',miss,'q',q, out['GM0473'])
