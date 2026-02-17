import os
import requests
from datetime import datetime
import time
from dotenv import load_dotenv

load_dotenv()

host = os.getenv("HOST_API")
token = os.getenv("TOKEN_API")

assunto_id = "293"
status_ok = ["A", "AN", "EN", "AS", "AG", "EX", "RAG"]
data_limite = datetime(2025, 10, 31, 23, 59, 59)

headers_lista = {
    "Authorization": token,
    "Content-Type": "application/json",
    "ixcsoft": "listar"
}

headers_fecha = {
    "Authorization": token,
    "Content-Type": "application/json"
}

def busca_os():
    os_lista = []
    pagina = 1
    
    while True:
        try:
            busca = {
                "qtype": "su_oss_chamado.id_assunto",
                "query": assunto_id,
                "oper": "=",
                "page": str(pagina),
                "rp": "1000"
            }
            
            resposta = requests.post(f"{host}/su_oss_chamado", json=busca, headers=headers_lista, timeout=60)
            
            if resposta.status_code != 200:
                break
            
            dados = resposta.json()
            registros = dados.get("registros", [])
            
            if not registros:
                break
            
            for os_item in registros:
                if os_item.get("status") in status_ok:
                    data_os = os_item.get("data_abertura")
                    if data_os and data_os not in ["", "0000-00-00 00:00:00", "0000-00-00"]:
                        try:
                            data_obj = datetime.strptime(data_os, "%Y-%m-%d %H:%M:%S")
                            if data_obj <= data_limite:
                                os_lista.append(os_item)
                        except:
                            pass
            
            total = int(dados.get("total", 0))
            if pagina * 1000 >= total:
                break
                
            pagina += 1
            time.sleep(0.2)
            
        except:
            break
    
    return os_lista

def fecha_os(os_item):
    try:
        agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        dados = {
            "id_chamado": str(os_item.get("id")),
            "status": "F",
            "id_tecnico": "306",
            "data_inicio": agora,
            "data_final": agora,
            "mensagem": "Finalizado automático - massa",
            "id_su_diagnostico": "64",
            "id_proxima_tarefa_aux": "116"
        }
        
        resposta = requests.post(
            f"{host}/su_oss_chamado_fechar/{os_item.get('id')}",
            json=dados,
            headers=headers_fecha,
            timeout=30
        )
        
        return resposta.status_code == 200
        
    except:
        return False

if __name__ == "__main__":
    if not host or not token:
        print("Configura as variáveis no .env")
        exit(1)
    
    print(f"Buscando chamados FIRST PAY (assunto {assunto_id})...")
    
    lista_os = busca_os()
    
    if not lista_os:
        print("Nada encontrado")
        exit(0)
    
    print(f"Encontrados: {len(lista_os)} chamados")
    
    finalizados = []
    
    for i, os_item in enumerate(lista_os, 1):
        if fecha_os(os_item):
            finalizados.append(os_item.get("id"))
        
        if i % 50 == 0:
            print(f"Processando... {i}/{len(lista_os)}")
        
        time.sleep(0.1)
    
    print(f"\nIDs dos chamados finalizados ({len(finalizados)}/{len(lista_os)}):")
    print("-" * 30)
    
    # Mostra 10 por linha
    for i in range(0, len(finalizados), 10):
        print(" ".join(map(str, finalizados[i:i+10])))