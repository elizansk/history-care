# CI/CD для History Care

## 1. Репозиторий

Создать проект на `hub.mos.ru` или `gitlab.com`, затем добавить remote и запушить:

```bash
git remote add hub https://hub.mos.ru/<login>/<project>.git
git push -u hub master
```

Если ветка называется `main`, а по заданию нужен `master`:

```bash
git branch -M master
git push -u hub master
```

## 2. Проверка Docker-сборки

Backend:

```bash
docker build -t history-care-backend:test -f Dockerfile .
```

Frontend:

```bash
docker build -t history-care-frontend:test frontend
```

## 3. GitLab Runner

На виртуальной машине установить Docker, kubectl, kind и GitLab Runner.

Runner регистрировать в режиме `shell`, тег указать:

```text
shell
```

Именно этот тег используется в `.gitlab-ci.yml`.

## 4. kind

Создать локальный Kubernetes-кластер на VM:

```bash
kind create cluster --name history-care
kubectl get pods -A
```

## 5. Первичный ручной деплой

```bash
docker build -t history-care-backend:latest -f Dockerfile .
docker build -t history-care-frontend:latest frontend

kind load docker-image history-care-backend:latest
kind load docker-image history-care-frontend:latest

kubectl create configmap history-care-conf --from-file=configs/ --namespace=default -o yaml --dry-run=client | kubectl apply -f -
kubectl apply -f manifests/
kubectl get pods
```

## 6. KUBECONFIG для CI/CD

Первый pipeline может упасть на `kubectl`, если runner не видит кластер.

Получить kubeconfig на VM:

```bash
sudo cat /root/.kube/config
```

В GitLab открыть:

```text
Settings -> CI/CD -> Variables
```

Создать переменную:

- key: `KUBECONFIG`
- type: `File`
- environment scope: `production`
- protected variable: включить
- value: содержимое `/root/.kube/config`

После этого перезапустить pipeline.

## 7. Что делает pipeline

`.gitlab-ci.yml` содержит 3 стадии:

- `build`: собирает backend и frontend Docker-образы с тегом `$CI_COMMIT_SHORT_SHA`;
- `upload`: загружает оба образа в kind;
- `deploy`: обновляет ConfigMap, применяет manifests, обновляет образы в deployment и показывает `kubectl get pods`.

Pipeline запускается только для ветки `master`.

## 8. Что показать преподавателю

- проект на hub.mos.ru/GitLab;
- подключенный GitLab Runner;
- `.gitlab-ci.yml`;
- Dockerfile backend и `frontend/Dockerfile`;
- папки `configs/` и `manifests/`;
- pipeline с тремя стадиями `build`, `upload`, `deploy`;
- логи `docker build`, `kind load docker-image`, `kubectl get pods`;
- в терминале VM результат:

```bash
kubectl get pods
kubectl get services
```
