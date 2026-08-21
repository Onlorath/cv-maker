package atsscore

import (
	"testing"

	"cvmaker/internal/features/atscheck"
	"cvmaker/internal/features/atsmatch"
)

func TestCombine_PerfectScores(t *testing.T) {
	format := atscheck.Report{Score: 100}
	match := atsmatch.MatchResponse{MatchScore: 100}
	r := Combine(format, match)
	if r.Score != 100 {
		t.Errorf("mükemmel skorlarda nihai skor 100 olmalı, alınan %d", r.Score)
	}
}

func TestCombine_WeightingIsApplied(t *testing.T) {
	// format 40, content 80 -> 40*0.25 + 80*0.75 = 10 + 60 = 70
	format := atscheck.Report{Score: 40}
	match := atsmatch.MatchResponse{MatchScore: 80}
	r := Combine(format, match)
	if r.Score != 70 {
		t.Errorf("beklenen 70, alınan %d", r.Score)
	}
}

func TestCombine_ContentDominatesOverFormat(t *testing.T) {
	// Format mükemmel ama içerik sıfırsa, nihai skor yine de düşük olmalı
	// (%75 ağırlık içerikte) — bu, algoritmanın gerçekten içerik-ağırlıklı
	// çalıştığını doğruluyor, sadece iddia değil.
	format := atscheck.Report{Score: 100}
	match := atsmatch.MatchResponse{MatchScore: 0}
	r := Combine(format, match)
	if r.Score != 25 {
		t.Errorf("format mükemmel, içerik sıfırken nihai skor 25 olmalı, alınan %d", r.Score)
	}
}

func TestCombine_ContentScorePointerSet(t *testing.T) {
	r := Combine(atscheck.Report{Score: 50}, atsmatch.MatchResponse{MatchScore: 60})
	if r.ContentScore == nil || *r.ContentScore != 60 {
		t.Errorf("contentScore 60 olarak set edilmeliydi")
	}
	if r.ContentPending {
		t.Error("Combine çağrıldığında contentPending false olmalı")
	}
}

func TestFormatOnly_DoesNotPenalizeMissingContent(t *testing.T) {
	// JD henüz yokken nihai skor, format skorunun %25'i DEĞİL, doğrudan
	// format skorunun kendisi olmalı — aksi halde kullanıcı hiç eşleştirme
	// çalıştırmadan yapay şekilde düşük bir skorla karşılaşır.
	format := atscheck.Report{Score: 90}
	r := FormatOnly(format)
	if r.Score != 90 {
		t.Errorf("JD yokken nihai skor format skoruyla eşit olmalı (90), alınan %d", r.Score)
	}
	if r.ContentScore != nil {
		t.Error("JD yokken contentScore nil olmalı")
	}
	if !r.ContentPending {
		t.Error("JD yokken contentPending true olmalı")
	}
}
