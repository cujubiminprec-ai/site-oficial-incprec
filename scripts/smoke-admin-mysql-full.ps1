$ErrorActionPreference = "Stop"

$baseUrl = if ($env:SMOKE_API_BASE) { $env:SMOKE_API_BASE.TrimEnd("/") } else { "http://127.0.0.1:3001" }
$adminEmail = if ($env:SMOKE_ADMIN_EMAIL) { $env:SMOKE_ADMIN_EMAIL } else { "admin@inprec.com" }
$adminPassword = if ($env:SMOKE_ADMIN_PASSWORD) { $env:SMOKE_ADMIN_PASSWORD } else { "admin123" }
$runId = "smoke-full-" + ([guid]::NewGuid().ToString("N").Substring(0, 8))

function Invoke-Api {
  param(
    [Parameter(Mandatory=$true)][string]$Method,
    [Parameter(Mandatory=$true)][string]$Path,
    [object]$Body = $null,
    [string]$Token = ""
  )

  $headers = @{}
  if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
  }

  $args = @{
    Method = $Method
    Uri = "$baseUrl$Path"
    Headers = $headers
  }

  if ($null -ne $Body) {
    $args.ContentType = "application/json"
    $args.Body = ($Body | ConvertTo-Json -Depth 20)
  }

  return Invoke-RestMethod @args
}

function Assert-Ok {
  param(
    [object]$Response,
    [string]$Message
  )
  if (-not $Response.sucesso) {
    throw $Message
  }
}

function Assert-True {
  param(
    [bool]$Condition,
    [string]$Message
  )
  if (-not $Condition) {
    throw $Message
  }
}

function Count-Matches {
  param([object]$Items)
  return @($Items).Count
}

Write-Host "==> Login admin"
$login = Invoke-Api POST "/api/auth/login" @{
  email = $adminEmail
  senha = $adminPassword
}
Assert-Ok $login "Login admin falhou."
$token = $login.dados.token
Assert-True ([bool]$token) "Token admin nao retornado."

$createdNoticias = @()
$createdServicos = @()
$createdGestores = @()
$createdUsuarios = @()
$createdTransparencia = @()
$createdPainel = @()
$originalMenu = $null
$originalEleicaoConfig = $null
$originalVotacaoConfig = $null
$originalCandidatos = $null
$originalSiteConfig = $null
$pageId = "$runId-pagina"

try {
  Write-Host "==> Noticias"
  $noticia = Invoke-Api POST "/api/noticias" @{
    titulo = "Noticia $runId"
    resumo = "Resumo real salvo no MySQL"
    conteudo = "Conteudo criado pelo smoke ampliado"
    image_url = "/uploads/noticias/$runId.jpg"
    categoria = "Teste"
    autor = "Smoke"
    destaque = $true
    publicado = $true
    tags = @("mysql", "admin", $runId)
  } $token
  Assert-Ok $noticia "Criacao de noticia falhou."
  $createdNoticias += $noticia.dados.id

  $noticiaAtualizada = Invoke-Api PUT "/api/noticias/$($noticia.dados.id)" @{
    titulo = "Noticia $runId atualizada"
    resumo = "Resumo atualizado no MySQL"
    publicado = $true
  } $token
  Assert-Ok $noticiaAtualizada "Atualizacao de noticia falhou."
  $noticiasPublicas = Invoke-Api GET "/api/noticias?busca=$runId"
  Assert-Ok $noticiasPublicas "Listagem publica de noticias falhou."
  Assert-True ((Count-Matches ($noticiasPublicas.dados | Where-Object { $_.titulo -like "*$runId*" })) -gt 0) "Noticia criada nao apareceu na listagem."

  Write-Host "==> Servicos"
  $servico = Invoke-Api POST "/api/servicos" @{
    titulo = "Servico $runId"
    descricao = "Servico real do painel"
    icone = "ri-service-line"
    linkUrl = "/servicos/$runId"
    ordem = 99
    destaque = $true
    ativo = $true
  } $token
  Assert-Ok $servico "Criacao de servico falhou."
  $createdServicos += $servico.dados.id
  $servicoAtualizado = Invoke-Api PUT "/api/servicos/$($servico.dados.id)" @{
    titulo = "Servico $runId atualizado"
    descricao = "Servico atualizado"
    icone = "ri-service-line"
    linkUrl = "/servicos/$runId-atualizado"
    ordem = 100
    destaque = $false
    ativo = $true
  } $token
  Assert-Ok $servicoAtualizado "Atualizacao de servico falhou."
  $servicosAdmin = Invoke-Api GET "/api/servicos/admin" $null $token
  Assert-Ok $servicosAdmin "Listagem admin de servicos falhou."
  Assert-True ((Count-Matches ($servicosAdmin.dados | Where-Object { $_.id -eq $servico.dados.id })) -eq 1) "Servico criado nao apareceu no admin."

  Write-Host "==> Gestores"
  $gestor = Invoke-Api POST "/api/gestores" @{
    nome = "Gestor $runId"
    cargo = "Cargo teste"
    grupo = "Diretoria"
    foto_url = "/uploads/avatares/$runId.jpg"
    email = "$runId@teste.local"
    telefone = "(92) 99999-0000"
    bio = "Bio real de teste"
    formacao = "Formacao"
    mandato = "2026-2028"
    posicao = 99
  } $token
  Assert-Ok $gestor "Criacao de gestor falhou."
  $createdGestores += $gestor.dados.id
  $gestorAtualizado = Invoke-Api PUT "/api/gestores/$($gestor.dados.id)" @{
    nome = "Gestor $runId atualizado"
    cargo = "Cargo atualizado"
    grupo = "Diretoria"
    ativo = $true
  } $token
  Assert-Ok $gestorAtualizado "Atualizacao de gestor falhou."
  $gestoresPublicos = Invoke-Api GET "/api/gestores"
  Assert-Ok $gestoresPublicos "Listagem publica de gestores falhou."
  Assert-True ((Count-Matches ($gestoresPublicos.dados | Where-Object { $_.id -eq $gestor.dados.id })) -eq 1) "Gestor criado nao apareceu na listagem."

  Write-Host "==> Paginas e blocos"
  $blocos = Invoke-Api PUT "/api/paginas/$pageId/blocos" @{
    blocos = @(
      @{
        bloco_id = "$runId-bloco"
        tipo = "texto"
        posicao = 1
        titulo = "Bloco $runId"
        texto = "Conteudo salvo no MySQL"
        alinhamento = "left"
      }
    )
  } $token
  Assert-Ok $blocos "Salvamento de blocos de pagina falhou."
  $blocosPublicos = Invoke-Api GET "/api/paginas/$pageId/blocos"
  Assert-Ok $blocosPublicos "Consulta de blocos de pagina falhou."
  Assert-True ((Count-Matches ($blocosPublicos.dados | Where-Object { $_.bloco_id -eq "$runId-bloco" })) -eq 1) "Bloco salvo nao voltou pela consulta."

  Write-Host "==> Configuracoes"
  $siteConfig = Invoke-Api GET "/api/configuracoes"
  Assert-Ok $siteConfig "Consulta de configuracoes falhou."
  $originalSiteConfig = $siteConfig.dados
  $siteConfigAtualizada = Invoke-Api PUT "/api/configuracoes" @{
    meta_descricao = "Smoke $runId"
  } $token
  Assert-Ok $siteConfigAtualizada "Atualizacao de configuracoes falhou."
  $appConfig = Invoke-Api PUT "/api/configuracoes/app/$runId" @{
    chave = $runId
    salvo = $true
  } $token
  Assert-Ok $appConfig "Atualizacao de app_config falhou."
  $appConfigGet = Invoke-Api GET "/api/configuracoes/app/$runId"
  Assert-Ok $appConfigGet "Consulta de app_config falhou."
  Assert-True ($appConfigGet.dados.salvo -eq $true) "app_config nao retornou valor salvo."

  Write-Host "==> Menu com restauracao"
  $menuAdmin = Invoke-Api GET "/api/menu/admin" $null $token
  Assert-Ok $menuAdmin "Consulta do menu admin falhou."
  $originalMenu = @($menuAdmin.dados)
  $menuTeste = @($originalMenu) + @(@{
    label = "Menu $runId"
    url = "/$runId"
    icone = "ri-test-tube-line"
    parent_id = $null
    posicao = 999
    novoTab = $false
    ativo = $true
  })
  $menuSave = Invoke-Api PUT "/api/menu/bulk" @{ itens = $menuTeste } $token
  Assert-Ok $menuSave "Salvamento bulk do menu falhou."
  Assert-True ((Count-Matches ($menuSave.dados | Where-Object { $_.label -eq "Menu $runId" })) -eq 1) "Item temporario do menu nao foi salvo."

  Write-Host "==> Transparencia"
  $doc = Invoke-Api POST "/api/transparencia" @{
    titulo = "Documento $runId"
    categoria = "Relatorios"
    icone = "ri-file-pdf-line"
    ano = 2026
    tipo_arquivo = "PDF"
    tamanho = "1 KB"
    arquivo_url = "/uploads/transparencia/$runId.pdf"
    descricao = "Documento de teste"
    destaque = $true
  } $token
  Assert-Ok $doc "Criacao de documento de transparencia falhou."
  $createdTransparencia += $doc.dados.id
  $docs = Invoke-Api GET "/api/transparencia?busca=$runId"
  Assert-Ok $docs "Consulta de transparencia falhou."
  Assert-True ((Count-Matches ($docs.dados | Where-Object { $_.id -eq $doc.dados.id })) -eq 1) "Documento de transparencia nao apareceu."

  $painel = Invoke-Api POST "/api/transparencia/painel" @{
    title = "Painel $runId"
    description = "Card temporario"
    fileUrl = "/uploads/transparencia/$runId.pdf"
    fileName = "$runId.pdf"
    fileType = "PDF"
    mimeType = "application/pdf"
    slideImages = @()
    order = 999
    isActive = $true
  } $token
  Assert-Ok $painel "Criacao de painel de transparencia falhou."
  $createdPainel += $painel.dados.id
  $painelUpdate = Invoke-Api PUT "/api/transparencia/painel/$($painel.dados.id)" @{
    title = "Painel $runId atualizado"
    description = "Card temporario atualizado"
    fileUrl = "/uploads/transparencia/$runId-v2.pdf"
    fileName = "$runId-v2.pdf"
    fileType = "PDF"
    mimeType = "application/pdf"
    slideImages = @()
    order = 998
    isActive = $true
  } $token
  Assert-Ok $painelUpdate "Atualizacao de painel de transparencia falhou."

  Write-Host "==> Eleicao com restauracao"
  $originalEleicaoConfig = (Invoke-Api GET "/api/eleicao/config").dados
  $eleicaoConfig = Invoke-Api PUT "/api/eleicao/config" @{
    titulo = "Eleicao $runId"
    descricao = "Configuracao temporaria"
    dataInicio = "2026-01-01"
    dataFim = "2026-12-31"
    status = "inativa"
    eleitoresAptos = 1
  } $token
  Assert-Ok $eleicaoConfig "Atualizacao de configuracao de eleicao falhou."
  $originalVotacaoConfig = (Invoke-Api GET "/api/eleicao/votacao-config").dados
  $votacaoConfig = Invoke-Api PUT "/api/eleicao/votacao-config" @{
    titulo = "Votacao $runId"
    habilitada = $false
  } $token
  Assert-Ok $votacaoConfig "Atualizacao de configuracao de votacao falhou."
  $originalCandidatos = @((Invoke-Api GET "/api/eleicao/candidatos/admin" $null $token).dados)
  $candidatos = Invoke-Api PUT "/api/eleicao/candidatos/bulk" @{
    candidatos = @(
      @{
        nome = "Candidato $runId"
        cargoCandidato = "Conselho"
        conselho = "Teste"
        fotoUrl = "/uploads/avatares/$runId.jpg"
        bio = "Bio"
        proposta = "Proposta"
        numero = 999
        votos = 0
        ativo = $true
      }
    )
  } $token
  Assert-Ok $candidatos "Salvamento bulk de candidatos falhou."
  Assert-True ((Count-Matches ($candidatos.dados | Where-Object { $_.nome -eq "Candidato $runId" })) -eq 1) "Candidato temporario nao foi salvo."

  Write-Host "==> Usuarios"
  $usuario = Invoke-Api POST "/api/usuarios" @{
    nome = "Usuario $runId"
    email = "$runId@teste.local"
    senha = "admin123"
    nivelAcesso = "operador"
    permissoes = @("analytics")
    ativo = $true
    descricao = "Usuario temporario de smoke"
  } $token
  Assert-Ok $usuario "Criacao de usuario falhou."
  $createdUsuarios += $usuario.dados.id
  $usuarioUpdate = Invoke-Api PUT "/api/usuarios/$($usuario.dados.id)" @{
    nome = "Usuario $runId atualizado"
    email = "$runId@teste.local"
    nivelAcesso = "operador"
    permissoes = @("analytics", "contato-admin")
    ativo = $true
    descricao = "Atualizado"
  } $token
  Assert-Ok $usuarioUpdate "Atualizacao de usuario falhou."
  $usuarios = Invoke-Api GET "/api/usuarios" $null $token
  Assert-Ok $usuarios "Listagem de usuarios falhou."
  Assert-True ((Count-Matches ($usuarios.dados | Where-Object { $_.id -eq $usuario.dados.id })) -eq 1) "Usuario criado nao apareceu na listagem."

  Write-Host ""
  Write-Host "Smoke ampliado concluido com sucesso para $runId"
}
finally {
  Write-Host "==> Limpando/restaurando dados temporarios"

  foreach ($id in $createdNoticias) {
    try { Invoke-Api DELETE "/api/noticias/$id" $null $token | Out-Null } catch {}
  }
  foreach ($id in $createdServicos) {
    try { Invoke-Api DELETE "/api/servicos/$id" $null $token | Out-Null } catch {}
  }
  foreach ($id in $createdGestores) {
    try { Invoke-Api DELETE "/api/gestores/$id" $null $token | Out-Null } catch {}
  }
  foreach ($id in $createdUsuarios) {
    try { Invoke-Api DELETE "/api/usuarios/$id" $null $token | Out-Null } catch {}
  }
  foreach ($id in $createdTransparencia) {
    try { Invoke-Api DELETE "/api/transparencia/$id" $null $token | Out-Null } catch {}
  }
  foreach ($id in $createdPainel) {
    try { Invoke-Api DELETE "/api/transparencia/painel/$id" $null $token | Out-Null } catch {}
  }
  try { Invoke-Api PUT "/api/paginas/$pageId/blocos" @{ blocos = @() } $token | Out-Null } catch {}
  if ($null -ne $originalMenu) {
    try { Invoke-Api PUT "/api/menu/bulk" @{ itens = @($originalMenu) } $token | Out-Null } catch {}
  }
  if ($null -ne $originalEleicaoConfig) {
    try {
      Invoke-Api PUT "/api/eleicao/config" @{
        titulo = $originalEleicaoConfig.titulo
        descricao = $originalEleicaoConfig.descricao
        dataInicio = $originalEleicaoConfig.data_inicio
        dataFim = $originalEleicaoConfig.data_fim
        status = $originalEleicaoConfig.status
        eleitoresAptos = $originalEleicaoConfig.eleitores_aptos
      } $token | Out-Null
    } catch {}
  }
  if ($null -ne $originalVotacaoConfig) {
    try { Invoke-Api PUT "/api/eleicao/votacao-config" $originalVotacaoConfig $token | Out-Null } catch {}
  }
  if ($null -ne $originalCandidatos) {
    try { Invoke-Api PUT "/api/eleicao/candidatos/bulk" @{ candidatos = @($originalCandidatos) } $token | Out-Null } catch {}
  }
  if ($null -ne $originalSiteConfig) {
    try {
      Invoke-Api PUT "/api/configuracoes" @{
        nome_site = $originalSiteConfig.nome_site
        nome_completo = $originalSiteConfig.nome_completo
        descricao_site = $originalSiteConfig.descricao_site
        logo_url = $originalSiteConfig.logo_url
        favicon_url = $originalSiteConfig.favicon_url
        cor_primaria = $originalSiteConfig.cor_primaria
        cor_secundaria = $originalSiteConfig.cor_secundaria
        cor_destaque = $originalSiteConfig.cor_destaque
        fonte_principal = $originalSiteConfig.fonte_principal
        email_contato = $originalSiteConfig.email_contato
        telefone_principal = $originalSiteConfig.telefone_principal
        telefone_whatsapp = $originalSiteConfig.telefone_whatsapp
        endereco_logradouro = $originalSiteConfig.endereco_logradouro
        endereco_cidade = $originalSiteConfig.endereco_cidade
        endereco_estado = $originalSiteConfig.endereco_estado
        endereco_cep = $originalSiteConfig.endereco_cep
        horario_atendimento = $originalSiteConfig.horario_atendimento
        facebook_url = $originalSiteConfig.facebook_url
        instagram_url = $originalSiteConfig.instagram_url
        youtube_url = $originalSiteConfig.youtube_url
        linkedin_url = $originalSiteConfig.linkedin_url
        twitter_url = $originalSiteConfig.twitter_url
        rodape_texto = $originalSiteConfig.rodape_texto
        meta_titulo = $originalSiteConfig.meta_titulo
        meta_descricao = $originalSiteConfig.meta_descricao
        meta_keywords = $originalSiteConfig.meta_keywords
        modo_manutencao = $originalSiteConfig.modo_manutencao
      } $token | Out-Null
    } catch {}
  }
}
