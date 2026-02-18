# backend/app.py
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from datetime import datetime
import subprocess
import json
import sys
import os

# Adiciona o diretório pai ao path para importar o backend original
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

@app.route('/')
def index():
    # Serve o frontend
    return render_template('../frontend/index.html')

@app.route('/executar', methods=['POST'])
def executar_backend():
    try:
        # Recebe os parâmetros do frontend
        dados = request.json
        assunto_id = dados.get('assunto_id')
        status_ok = dados.get('status_ok', [])
        data_limite_str = dados.get('data_limite')
        id_diagnostico = dados.get('id_diagnostico', '64')  # Valor padrão se não informado
        id_tarefa = dados.get('id_tarefa', '116')  # Valor padrão se não informado
        
        # Converte a data limite
        try:
            data_limite = datetime.strptime(data_limite_str, "%Y-%m-%dT%H:%M:%S")
        except:
            data_limite = datetime.strptime(data_limite_str, "%Y-%m-%d")
            data_limite = data_limite.replace(hour=23, minute=59, second=59)
        
        # Executa a lógica com os parâmetros adicionais
        resultado = executar_logica(assunto_id, status_ok, data_limite, id_diagnostico, id_tarefa)
        
        return jsonify({
            'sucesso': True,
            'mensagem': f'Processamento concluído. {resultado["total"]} chamados encontrados, {resultado["finalizados"]} finalizados.',
            'detalhes': resultado
        })
    
    except Exception as e:
        return jsonify({
            'sucesso': False,
            'mensagem': f'Erro: {str(e)}'
        }), 500

def executar_logica(assunto_id, status_ok, data_limite, id_diagnostico, id_tarefa=""):
    """
    Esta função contém a lógica adaptada do seu backend original
    id_tarefa é opcional - se vazio, não será enviado na requisição
    """
    import requests
    import time
    from datetime import datetime
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    host = os.getenv("HOST_API")
    token = os.getenv("TOKEN_API")
    
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
    
    def fecha_os(os_item, id_diagnostico, id_tarefa):
        try:
            agora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Dados obrigatórios
            dados = {
                "id_chamado": str(os_item.get("id")),
                "status": "F",
                "id_tecnico": "306",
                "data_inicio": agora,
                "data_final": agora,
                "mensagem": "Finalizado em massa - API Marques",
                "id_su_diagnostico": id_diagnostico
            }
            
            # Adiciona id_proxima_tarefa_aux apenas se id_tarefa não for vazio
            if id_tarefa and id_tarefa.strip():  # Verifica se não é None, vazio ou só espaços
                dados["id_proxima_tarefa_aux"] = id_tarefa
            
            resposta = requests.post(
                f"{host}/su_oss_chamado_fechar/{os_item.get('id')}",
                json=dados,
                headers=headers_fecha,
                timeout=30
            )
            
            return resposta.status_code == 200
            
        except Exception as e:
            # print(f"Erro ao fechar OS {os_item.get('id')}: {e}")
            return False
    
    if not host or not token:
        raise Exception("Configura as variáveis no .env")
    
    # print(f"Buscando chamados (assunto {assunto_id})...")
    # print(f"IDs configurados: Diagnóstico = {id_diagnostico}, Tarefa = {id_tarefa if id_tarefa else 'Nenhum (opcional)'}")
    
    lista_os = busca_os()
    
    if not lista_os:
        return {"total": 0, "finalizados": 0, "ids_finalizados": []}
    
    # print(f"Encontrados: {len(lista_os)} chamados")
    
    finalizados = []
    
    for i, os_item in enumerate(lista_os, 1):
        if fecha_os(os_item, id_diagnostico, id_tarefa):
            finalizados.append(os_item.get("id"))
        
        if i % 50 == 0:
            # print(f"Processando... {i}/{len(lista_os)}")
            pass
        
        time.sleep(0.1)
    
    return {
        "total": len(lista_os),
        "finalizados": len(finalizados),
        "ids_finalizados": finalizados
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3535)