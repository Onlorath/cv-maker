.PHONY: check check-backend check-frontend dev

# Uygulamayı tamamen kapatır, sıfırdan .app paketi olarak derler ve arkasında terminal olmadan başlatır.
dev:
	@echo "🛑 Mevcut uygulama kapatılıyor..."
	@pkill -f "cv_maker" || true
	@echo "🧹 Önceki kalıntılar (Detritus) temizleniyor..."
	@find . -type f -name ".DS_Store" -exec rm -f {} \; || true
	@find . -type f -name "Icon?" -exec rm -f {} \; || true
	@xattr -cr . 2>/dev/null || true
	@rm -rf build/bin
	@echo "🔨 Uygulama sıfırdan derleniyor (Wails Build)..."
	@~/go/bin/wails build -clean || (echo "⚠️ Wails imzalama hatası algılandı, paket manuel temizlenip imzalanıyor..." && xattr -cr build/bin/cv_maker.app 2>/dev/null && codesign --force --deep --sign - build/bin/cv_maker.app) || (echo "❌ Derleme tamamen başarısız oldu!" && exit 1)
	@echo "🚀 Uygulama başlatılıyor..."
	@open build/bin/cv_maker.app
	@echo "✅ Başarıyla açıldı!"

check: check-backend check-frontend
	@echo "\n✅ Harika! Tüm kodlar hatasız çalışıyor."

# Go (Backend) kodlarındaki sözdizimi, olası bug'lar ve formatlama hatalarını bulur
check-backend:
	@echo "🔍 Backend (Go) denetleniyor..."
	@go vet ./... || (echo "❌ Go Vet hatası bulundu!" && exit 1)
	@echo "✅ Backend kodları temiz."

# TypeScript ve React (Frontend) kodlarındaki tip hatalarını ve oxlint kurallarını denetler
check-frontend:
	@echo "\n🔍 Frontend (TypeScript & React) denetleniyor..."
	@cd frontend && npm run typecheck || (echo "❌ TypeScript tip hatası bulundu!" && exit 1)
	@cd frontend && npm run lint || (echo "❌ Frontend Linter hatası bulundu!" && exit 1)
	@echo "✅ Frontend kodları temiz."
