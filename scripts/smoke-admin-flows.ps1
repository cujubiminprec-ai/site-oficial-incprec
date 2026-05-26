$ErrorActionPreference = "Stop"

function Assert-True {
  param([bool]$Condition, [string]$Message)
  if (-not $Condition) { throw $Message }
}

function Invoke-Json {
  param(
    [string]$Method,
    [string]$Url,
    [hashtable]$Headers = @{},
    $Body = $null
  )

  $params = @{
    Method      = $Method
    Uri         = $Url
    ContentType = "application/json"
    Headers     = $Headers
  }
  if ($null -ne $Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }
  return Invoke-RestMethod @params
}

$apiHost = if ($env:SMOKE_API_BASE) { $env:SMOKE_API_BASE } else { "http://127.0.0.1:3001" }
$baseUrl = "$apiHost/api"
$runId = "smoke-" + [guid]::NewGuid().ToString("N").Substring(0, 8)

Write-Host "==> Healthcheck"
$health = Invoke-Json -Method "GET" -Url "$apiHost/health"
Assert-True ($health.status -eq "ok" -and $health.db -eq "mysql") "Healthcheck falhou ou banco nao e MySQL."

Write-Host "==> Login admin"
$login = Invoke-Json -Method "POST" -Url "$baseUrl/auth/login" -Body @{
  email = "admin@inprec.com"
  senha = "admin123"
}
Assert-True ($login.sucesso -eq $true -and -not [string]::IsNullOrWhiteSpace($login.dados.token)) "Login falhou."
$headers = @{ Authorization = "Bearer $($login.dados.token)" }

Write-Host "==> Conteudo: slides e FAQ"
$slides = Invoke-Json -Method "PUT" -Url "$baseUrl/conteudo/slides/bulk" -Headers $headers -Body @{
  slides = @(
    @{
      titulo = "Slide $runId"
      subtitulo = "Validacao MySQL"
      image_url = "/uploads/noticias/audiencias-publicas-2025/capa/audiencia-publica-inprec-2025-capa.jpg"
      cta_label = "Abrir"
      cta_url = "/noticias"
      ativo = $true
      ordem = 1
      use_tint = $true
      show_content = $true
    }
  )
}
Assert-True (@($slides.dados).Count -eq 1) "Falha ao salvar slides."

$faq = Invoke-Json -Method "PUT" -Url "$baseUrl/conteudo/faq/bulk" -Headers $headers -Body @{
  faqs = @(
    @{
      categoria = "Smoke"
      pergunta = "Pergunta $runId?"
      resposta = "Resposta $runId."
      ativo = $true
      ordem = 1
    }
  )
}
Assert-True (@($faq.dados).Count -eq 1) "Falha ao salvar FAQ."

Write-Host "==> Curso e inscricao publica"
$cursos = Invoke-Json -Method "PUT" -Url "$baseUrl/conteudo/cursos/bulk" -Headers $headers -Body @{
  cursos = @(
    @{
      titulo = "Curso $runId"
      tipo = "curso"
      categoria = "Teste"
      status = "aberto"
      data = "2026-06-01"
      hora = "09:00"
      local = "INPREC"
      descricao = "Curso temporario de smoke"
      certificado = $true
      vagasIlimitadas = $false
      vagas = 10
      vagasRestantes = 10
      online = $false
      publicado = $true
      destaque = $false
    }
  )
}
$cursoId = $cursos.dados[0].id
Assert-True ($cursoId -gt 0) "Falha ao salvar curso."

$inscricao = Invoke-Json -Method "POST" -Url "$baseUrl/conteudo/cursos/$cursoId/inscrever" -Body @{
  nome = "Inscrito $runId"
  email = "$runId@teste.local"
  telefone = "69999999999"
  cpf = "00000000000"
}
Assert-True ($inscricao.sucesso -eq $true -and $inscricao.dados.id -gt 0) "Falha ao inscrever em curso."

Write-Host "==> Eventos e inscritos no painel"
$evento = Invoke-Json -Method "POST" -Url "$baseUrl/eventos" -Headers $headers -Body @{
  titulo = "Evento $runId"
  tipo = "capacitacao"
  status = "aberto"
  data_inicio = "2026-06-15"
  hora_inicio = "08:00"
  local = "INPREC"
  vagas = 20
  publicado = $true
}
Assert-True ($evento.sucesso -eq $true -and $evento.dados.id -gt 0) "Falha ao criar evento."

$inscritoEvento = Invoke-Json -Method "POST" -Url "$baseUrl/eventos/inscricoes/admin" -Headers $headers -Body @{
  eventoId = $evento.dados.id
  nome = "Inscrito $runId"
  email = "$runId-evento@teste.local"
  telefone = "69999999999"
  matricula = "123"
  cargo = "SEMED"
}
Assert-True ($inscritoEvento.sucesso -eq $true -and $inscritoEvento.dados.id -gt 0) "Falha ao criar inscrito no evento."

$inscritosEvento = Invoke-Json -Method "GET" -Url "$baseUrl/eventos/inscricoes/admin" -Headers $headers
Assert-True (@($inscritosEvento.dados).Count -gt 0) "Falha ao listar inscritos do evento."

$presencaEvento = Invoke-Json -Method "PUT" -Url "$baseUrl/eventos/inscricoes/$($inscritoEvento.dados.id)" -Headers $headers -Body @{
  presenca = 1
  status = "pendente"
}
Assert-True ($presencaEvento.sucesso -eq $true -and $presencaEvento.dados.presenca -eq 1) "Falha ao atualizar inscrito/presenca."

Write-Host "==> Upload unico e multiplo"
$pdfPath = "D:/inprec/public/uploads/documentos/1778981401437-58599f4f.pdf"
$jpgPath = "D:/inprec/public/uploads/noticias/audiencias-publicas-2025/capa/audiencia-publica-inprec-2025-capa.jpg"
$jpgPath2 = "D:/inprec/public/uploads/noticias/curso-certificacao-rpps-2024/capa/curso-inprec.jpg"
$uploadOne = curl.exe -s -H "Authorization: Bearer $($login.dados.token)" -F "arquivo=@$pdfPath" "$baseUrl/upload?pasta=pdfs" | ConvertFrom-Json
$uploadMany = curl.exe -s -H "Authorization: Bearer $($login.dados.token)" -F "arquivos=@$jpgPath" -F "arquivos=@$jpgPath2" "$baseUrl/upload/multiplo?pasta=noticias" | ConvertFrom-Json
Assert-True ($uploadOne.sucesso -eq $true) "Falha no upload unico."
Assert-True (@($uploadMany.dados).Count -eq 2) "Falha no upload multiplo."

Write-Host "==> Analytics, contato e pesquisa"
$track = Invoke-Json -Method "POST" -Url "$baseUrl/analytics/track" -Body @{
  tipo = "page_view"
  path = "/smoke/$runId"
  pageName = "Smoke $runId"
}
Assert-True ($track.sucesso -eq $true) "Falha no analytics."

$contato = Invoke-Json -Method "POST" -Url "$baseUrl/contato" -Body @{
  nome = "Contato $runId"
  email = "$runId-contato@teste.local"
  assunto = "Assunto $runId"
  mensagem = "Mensagem $runId"
}
Assert-True ($contato.sucesso -eq $true -and $contato.dados.id -gt 0) "Falha no contato."

$pesquisa = Invoke-Json -Method "POST" -Url "$baseUrl/pesquisa" -Body @{
  nota = 5
  comentario = "Comentario $runId"
  servico = "Servico $runId"
}
Assert-True ($pesquisa.sucesso -eq $true -and $pesquisa.dados.id -gt 0) "Falha na pesquisa."

Write-Host "==> LAI, ouvidoria, formularios, auditoria e paineis admin"
$lai = Invoke-Json -Method "POST" -Url "$baseUrl/lai" -Body @{
  solicitante = "LAI $runId"
  email = "$runId-lai@teste.local"
  descricao = "Pedido LAI $runId"
}
Assert-True ($lai.sucesso -eq $true -and -not [string]::IsNullOrWhiteSpace($lai.dados.protocolo)) "Falha ao criar pedido LAI."
$laiConsulta = Invoke-Json -Method "GET" -Url "$baseUrl/lai/consultar/$($lai.dados.protocolo)"
Assert-True ($laiConsulta.sucesso -eq $true -and $laiConsulta.dados.protocolo -eq $lai.dados.protocolo) "Falha ao consultar LAI."
$laiAdmin = Invoke-Json -Method "GET" -Url "$baseUrl/lai" -Headers $headers
Assert-True (@($laiAdmin.dados).Count -gt 0) "Falha ao listar LAI no painel."

$ouvidoria = Invoke-Json -Method "POST" -Url "$baseUrl/ouvidoria" -Body @{
  tipo = "reclamacao"
  assunto = "Assunto $runId"
  descricao = "Mensagem $runId"
  nome = "Ouvidor $runId"
  email = "$runId-ouv@teste.local"
  anonimo = $false
}
Assert-True ($ouvidoria.sucesso -eq $true -and -not [string]::IsNullOrWhiteSpace($ouvidoria.dados.protocolo)) "Falha ao criar manifestacao de ouvidoria."
$ouvidoriaConsulta = Invoke-Json -Method "GET" -Url "$baseUrl/ouvidoria/consultar/$($ouvidoria.dados.protocolo)"
Assert-True ($ouvidoriaConsulta.sucesso -eq $true -and $ouvidoriaConsulta.dados.protocolo -eq $ouvidoria.dados.protocolo) "Falha ao consultar ouvidoria."
$ouvidoriaAdmin = Invoke-Json -Method "GET" -Url "$baseUrl/ouvidoria" -Headers $headers
Assert-True (@($ouvidoriaAdmin.dados).Count -gt 0) "Falha ao listar ouvidoria no painel."

$formulario = Invoke-Json -Method "POST" -Url "$baseUrl/formularios" -Body @{
  formularioNome = "formulario-$runId"
  nome = "Formulario $runId"
  email = "$runId-form@teste.local"
  dados = @{ campo = "valor" }
}
Assert-True ($formulario.sucesso -eq $true -and $formulario.dados.id -gt 0) "Falha ao criar formulario."
$formulariosAdmin = Invoke-Json -Method "GET" -Url "$baseUrl/formularios/admin" -Headers $headers
Assert-True (@($formulariosAdmin.dados).Count -gt 0) "Falha ao listar formularios no painel."

$analyticsAdmin = Invoke-Json -Method "GET" -Url "$baseUrl/analytics/admin" -Headers $headers
Assert-True ($analyticsAdmin.sucesso -eq $true -and $analyticsAdmin.dados.totalEventos -gt 0) "Falha ao listar analytics no painel."
$auditoriaAdmin = Invoke-Json -Method "GET" -Url "$baseUrl/auditoria" -Headers $headers
Assert-True ($auditoriaAdmin.sucesso -eq $true -and @($auditoriaAdmin.dados).Count -gt 0) "Falha ao listar auditoria no painel."

Write-Host ""
Write-Host "Smoke tests concluidos com sucesso para $runId"
